/**
 * 解析 LRC 格式歌词
 * @param {string} lrcText 
 * @returns {Array<{ time: number, text: string }>}
 */
export function parseLyric(lrcText) {
  if (!lrcText) return []
  const lines = lrcText.split('\n')
  const result = []
  const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g
  
  for (const raw of lines) {
    if (!raw.trim()) continue
    const matches = [...raw.matchAll(timeReg)]
    if (!matches.length) continue
    const text = raw.replace(timeReg, '').trim() || '♪'
    for (const m of matches) {
      const mm = parseInt(m[1], 10)
      const ss = parseInt(m[2], 10)
      const ms = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0
      result.push({ time: mm * 60 + ss + ms / 1000, text })
    }
  }
  return result.sort((a, b) => a.time - b.time)
}

/**
 * 根据当前播放时间检索激活的歌词索引
 * @param {Array<{ time: number, text: string }>} lyrics 
 * @param {number} currentTime 
 * @returns {number}
 */
export function findCurrentLyricIndex(lyrics, currentTime) {
  if (!lyrics || !lyrics.length) return -1
  let index = -1
  for (let k = 0; k < lyrics.length; k++) {
    if (currentTime >= lyrics[k].time) {
      index = k
    } else {
      break
    }
  }
  return index
}

