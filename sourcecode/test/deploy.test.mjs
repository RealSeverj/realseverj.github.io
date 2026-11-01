import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'severj-deploy-test-'))
  // 清理仅限本测试创建的临时目录。
  assert.equal(path.dirname(root), path.resolve(tmpdir()))
  t.after(() => rm(root, { recursive: true, force: true }))

  const scripts = path.join(root, 'sourcecode/scripts')
  await mkdir(scripts, { recursive: true })
  await mkdir(path.join(root, 'assets'))
  await writeFile(path.join(root, 'assets/old.js'), 'old asset')
  await writeFile(path.join(root, 'index.html'), 'old index')
  await cp(new URL('../scripts/deploy.mjs', import.meta.url), path.join(scripts, 'deploy.mjs'))
  return root
}

function sync(root) {
  return spawnSync(process.execPath, [path.join(root, 'sourcecode/scripts/deploy.mjs')], {
    encoding: 'utf8',
    windowsHide: true,
  })
}

test('同步替换旧构建、复制 public 文件并保留独立子站', async t => {
  const root = await fixture(t)
  const dist = path.join(root, 'sourcecode/dist')
  await mkdir(path.join(dist, 'assets'), { recursive: true })
  await mkdir(path.join(root, 'components/demo'), { recursive: true })
  await writeFile(path.join(root, 'components/demo/index.html'), 'independent site')
  await writeFile(path.join(dist, 'index.html'), 'new index')
  await writeFile(path.join(dist, 'assets/new.js'), 'new asset')
  await writeFile(path.join(dist, 'links.json'), '{"sections":[]}')

  const result = sync(root)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), 'new index')
  assert.equal(await readFile(path.join(root, 'assets/new.js'), 'utf8'), 'new asset')
  await assert.rejects(readFile(path.join(root, 'assets/old.js')), { code: 'ENOENT' })
  assert.equal(await readFile(path.join(root, 'links.json'), 'utf8'), '{"sections":[]}')
  assert.equal(await readFile(path.join(root, 'components/demo/index.html'), 'utf8'), 'independent site')
})

test('构建不完整时保留原发布文件并返回失败', async t => {
  const root = await fixture(t)
  const dist = path.join(root, 'sourcecode/dist')
  await mkdir(dist)
  await writeFile(path.join(dist, 'index.html'), 'incomplete build')

  assert.notEqual(sync(root).status, 0)
  assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), 'old index')
  assert.equal(await readFile(path.join(root, 'assets/old.js'), 'utf8'), 'old asset')
})
