import assert from 'node:assert/strict'
import { open, readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { parseBlob } from 'music-metadata'

const musicDir = new URL('../public/music/', import.meta.url)

test('播放器使用的前 512 KB 能读出每首 MP3 的标签和封面', async t => {
  const files = await readdir(musicDir)
  const tracks = files.filter(name => name.endsWith('.mp3'))
  assert.ok(tracks.length > 0)

  for (const name of tracks) {
    await t.test(name, async () => {
      const file = await open(new URL(encodeURIComponent(name), musicDir))
      let bytes
      try {
        const buffer = new Uint8Array(512144)
        const { bytesRead } = await file.read(buffer)
        bytes = buffer.subarray(0, bytesRead)
      } finally {
        await file.close()
      }

      const metadata = await parseBlob(new Blob([bytes], { type: 'audio/mpeg' }))
      const expectedTitle = name.slice(name.indexOf(' - ') + 3, -4)
      assert.equal(metadata.common.title, expectedTitle)
      assert.ok(metadata.common.artist)
      assert.ok(metadata.common.album)
      assert.ok(metadata.common.picture?.[0]?.data.length > 0)
      assert.equal(metadata.common.picture[0].format, 'image/jpeg')
    })
  }

  for (const name of files.filter(name => name.endsWith('.lrc'))) {
    assert.ok(tracks.includes(name.replace(/\.lrc$/, '.mp3')), `歌词匹配歌曲: ${name}`)
  }
})

test('playlist.json 清单结构完整且封面文件真实存在', async () => {
  const playlistFile = new URL('playlist.json', musicDir)
  const content = await readFile(playlistFile, 'utf8')
  const list = JSON.parse(content)
  assert.ok(Array.isArray(list) && list.length > 0)

  for (const item of list) {
    assert.ok(item.id, '歌曲包含 id')
    assert.ok(item.title, `歌曲 ${item.id} 包含 title`)
    assert.ok(item.artist, `歌曲 ${item.id} 包含 artist`)
    assert.ok(item.src, `歌曲 ${item.id} 包含 src`)

    if (item.cover) {
      // 校验封面图片在磁盘上真实存在
      const relativePath = decodeURIComponent(item.cover.replace(/^\/music\//, ''))
      const coverDiskPath = path.join(fileURLToPath(musicDir), relativePath)
      const fileStat = await stat(coverDiskPath)
      assert.ok(fileStat.isFile(), `封面文件应存在: ${coverDiskPath}`)
    }
  }
})
