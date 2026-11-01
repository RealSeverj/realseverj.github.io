import { cp, lstat, mkdir, readdir, realpath, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceRoot = fileURLToPath(new URL('../', import.meta.url))
const repoRoot = await realpath(path.resolve(sourceRoot, '..'))
const dist = path.join(sourceRoot, 'dist')
const rootAssets = path.resolve(repoRoot, 'assets')

// 在改动发布目录前确认构建完整，避免失败构建清空现有站点。
const index = await lstat(path.join(dist, 'index.html'))
const assets = await lstat(path.join(dist, 'assets'))
if (!index.isFile() || !assets.isDirectory() || assets.isSymbolicLink()) {
  throw new Error('Build output is incomplete. Run npm run build first.')
}

// 只清理仓库根目录的构建资源；拒绝符号链接和指向其他目录的路径。
if (path.relative(repoRoot, rootAssets) !== 'assets') {
  throw new Error(`Unexpected assets directory: ${rootAssets}`)
}
const existingAssets = await lstat(rootAssets).catch(error => {
  if (error.code !== 'ENOENT') throw error
})
if (existingAssets && (!existingAssets.isDirectory() || existingAssets.isSymbolicLink())) {
  throw new Error(`Assets directory must be a regular directory: ${rootAssets}`)
}

await rm(rootAssets, { recursive: true, force: true })
await mkdir(rootAssets)
await cp(path.join(dist, 'assets'), rootAssets, { recursive: true })

// 同步 public 资源，保留 components/ 等独立子站。
for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (entry.name === 'index.html' || entry.name === 'assets') continue
  await cp(path.join(dist, entry.name), path.join(repoRoot, entry.name), {
    recursive: true,
    force: true,
  })
}

// 资源复制成功后再更新首页引用。
await cp(path.join(dist, 'index.html'), path.join(repoRoot, 'index.html'))
console.log(`Build synchronized to ${repoRoot}`)
