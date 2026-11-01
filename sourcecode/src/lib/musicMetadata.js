import { parseBlob } from 'music-metadata'

/**
 * 音频元数据与封面解析
 */
export class MusicMetadataManager {
  constructor() {
    this.createdObjectUrls = []
  }

  /**
   * 从音频 URL 和文件路径提取元数据与封面
   * @param {string} audioUrl 
   * @param {string} filePath 
   * @returns {Promise<{ title: string, artist: string, album: string, cover: string }>}
   */
  async extract(audioUrl, filePath) {
    const fileName = filePath.split('/').pop().replace(/\.(mp3|flac|wav|ogg)$/i, '')
    let title = fileName
    let artist = '未知艺术家'
    let album = ''
    let cover = ''

    try {
      // 仅请求前 512KB，足以读取大多数文件的标签
      const res = await fetch(audioUrl, { headers: { Range: 'bytes=0-512143' } })
      if (!res.ok) throw new Error(`音频标签请求失败: ${res.status}`)
      const blob = await res.blob()
      const meta = await parseBlob(blob)
      const { common } = meta || {}

      if (common) {
        title = common.title || fileName
        artist = common.artist || '未知艺术家'
        album = common.album || ''

        if (common.picture?.length) {
          const pic = common.picture[0]
          const coverBlob = new Blob([pic.data], { type: pic.format || 'image/jpeg' })
          cover = URL.createObjectURL(coverBlob)
          this.createdObjectUrls.push(cover)
        }
      }
    } catch (metaError) {
      console.warn('无法读取音频标签，使用文件名解析:', metaError)
      const parts = fileName.split(' - ')
      if (parts.length >= 2) {
        artist = parts[0].trim()
        title = parts.slice(1).join(' - ').trim()
      }
    }

    return { title, artist, album, cover }
  }

  /**
   * 释放所有已创建的 Blob URL
   */
  cleanup() {
    this.createdObjectUrls.forEach(url => URL.revokeObjectURL(url))
    this.createdObjectUrls = []
  }
}

