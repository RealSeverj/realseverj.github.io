import { ref } from 'vue'
import { parseLyric, findCurrentLyricIndex } from '../lib/lyric.js'

/** 歌词请求与播放时间索引；不持有原生 audio 元素。 */
export function usePlayerLyrics() {
  const parsedLyrics = ref([])
  const currentLyricIndex = ref(-1)

  async function loadLyric(track) {
    if (!track?.lrc) {
      parsedLyrics.value = []
      currentLyricIndex.value = -1
      return
    }
    try {
      const response = await fetch(track.lrc)
      if (response.ok) {
        parsedLyrics.value = parseLyric(await response.text())
      } else {
        parsedLyrics.value = []
      }
      currentLyricIndex.value = -1
    } catch (error) {
      console.warn('加载歌词失败:', error)
      parsedLyrics.value = []
      currentLyricIndex.value = -1
    }
  }

  function updateLyric(currentTime) {
    currentLyricIndex.value = findCurrentLyricIndex(parsedLyrics.value, currentTime)
  }

  return { parsedLyrics, currentLyricIndex, loadLyric, updateLyric }
}
