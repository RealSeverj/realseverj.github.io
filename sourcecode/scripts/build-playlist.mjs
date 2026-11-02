import { readdir, open, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseBlob } from 'music-metadata'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const musicDir = path.resolve(__dirname, '../public/music')
const coversDir = path.join(musicDir, 'covers')

await mkdir(coversDir, { recursive: true })

const entries = await readdir(musicDir, { withFileTypes: true })
const audioFiles = entries
  .filter(e => e.isFile() && /\.(mp3|flac|wav|ogg)$/i.test(e.name))
  .map(e => e.name)
  .sort()

const lrcSet = new Set(
  entries
    .filter(e => e.isFile() && /\.lrc$/i.test(e.name))
    .map(e => e.name.replace(/\.lrc$/i, ''))
)

const playlist = []

for (const fileName of audioFiles) {
  const filePath = path.join(musicDir, fileName)
  const baseName = fileName.replace(/\.(mp3|flac|wav|ogg)$/i, '')

  let title = baseName
  let artist = '未知艺术家'
  let album = ''
  let coverUrl = ''

  const parts = baseName.split(' - ')
  if (parts.length >= 2) {
    artist = parts[0].trim()
    title = parts.slice(1).join(' - ').trim()
  }

  const fileHandle = await open(filePath)
  try {
    const buffer = new Uint8Array(512144)
    const { bytesRead } = await fileHandle.read(buffer)
    const blob = new Blob([buffer.subarray(0, bytesRead)], { type: 'audio/mpeg' })
    const meta = await parseBlob(blob)
    const { common } = meta || {}

    if (common) {
      if (common.title) title = common.title
      if (common.artist) artist = common.artist
      if (common.album) album = common.album

      if (common.picture?.length) {
        const pic = common.picture[0]
        const ext = pic.format === 'image/png' ? 'png' : 'jpg'
        const coverFileName = `${baseName}.${ext}`
        const coverFilePath = path.join(coversDir, coverFileName)
        await writeFile(coverFilePath, Buffer.from(pic.data))
        coverUrl = `/music/covers/${encodeURIComponent(coverFileName)}`
      }
    }
  } catch (err) {
    console.warn(`[build-playlist] 无法解析 ${fileName} 的 ID3，使用文件名兜底:`, err.message)
  } finally {
    await fileHandle.close()
  }

  const hasLrc = lrcSet.has(baseName)
  const lrcUrl = hasLrc ? `/music/${encodeURIComponent(baseName)}.lrc` : ''
  const srcUrl = `/music/${encodeURIComponent(fileName)}`

  playlist.push({
    id: baseName,
    title,
    artist,
    album,
    duration: 0,
    src: srcUrl,
    cover: coverUrl,
    lrc: lrcUrl
  })
}

const outputPath = path.join(musicDir, 'playlist.json')
await writeFile(outputPath, JSON.stringify(playlist, null, 2), 'utf8')
console.log(`[build-playlist] 成功生成播放列表清单: ${playlist.length} 首歌曲 -> ${outputPath}`)

