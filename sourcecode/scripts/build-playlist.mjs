import { fileURLToPath } from 'node:url'
import { buildPlaylist } from './lib/playlist.mjs'

const musicDir = fileURLToPath(new URL('../public/music/', import.meta.url))
const { playlist, outputPath } = await buildPlaylist(musicDir)
console.log(`[build-playlist] 成功生成播放列表清单: ${playlist.length} 首歌曲 -> ${outputPath}`)

