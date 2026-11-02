import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createStaticServer } from '../scripts/lib/static-server.mjs'

test('本地服务保留目录首页、SPA 回退、静态文件 404 和含特殊字符的音乐地址', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'severj-server-test-'))
  assert.equal(path.dirname(root), path.resolve(tmpdir()))
  t.after(() => rm(root, { recursive: true, force: true }))
  await writeFile(path.join(root, 'index.html'), 'home')
  await mkdir(path.join(root, 'components/demo'), { recursive: true })
  await writeFile(path.join(root, 'components/demo/index.html'), 'subsite')
  const name = 'Artist; Name + Other #1.mp3'
  await writeFile(path.join(root, name), 'audio')
  const server = createStaticServer(root)
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())))
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  assert.equal(await (await fetch(`${base}/components/demo/`)).text(), 'subsite')
  assert.equal(await (await fetch(`${base}/unmatched-route`)).text(), 'home')
  const missing = await fetch(`${base}/missing.json`)
  assert.equal(missing.status, 404)
  assert.equal(await missing.text(), 'Not Found')
  const audio = await fetch(`${base}/${encodeURIComponent(name)}`)
  assert.equal(audio.headers.get('content-type'), 'audio/mpeg')
  assert.equal(audio.headers.get('cache-control'), 'no-cache')
  assert.equal(await audio.text(), 'audio')
})
