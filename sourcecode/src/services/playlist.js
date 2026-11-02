/** 按原有顺序尝试清单地址，忽略静态服务器返回的 HTML 回退页。 */
export async function fetchPlaylist() {
  const paths = ['/music/playlist.json', 'music/playlist.json', './music/playlist.json']
  for (const path of paths) {
    try {
      const response = await fetch(path)
      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('html')) continue
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) return data
      }
    } catch { /* 当前地址不可用时，继续尝试下一个地址。 */ }
  }
  throw new Error('未能从已知路径获取到有效的 playlist.json')
}

/** 将构建清单转换为播放器使用的音轨结构。 */
export function toPlayerTrack(item) {
  return {
    id: item.id,
    url: item.src,
    path: item.src,
    title: item.title,
    artist: item.artist,
    album: item.album || '',
    duration: item.duration || 0,
    cover: item.cover || '',
    lrc: item.lrc || ''
  }
}
