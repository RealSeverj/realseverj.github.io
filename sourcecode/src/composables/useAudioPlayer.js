import { ref, computed } from 'vue'
import { fetchPlaylist, toPlayerTrack } from '../services/playlist.js'
import { usePlayerLyrics } from './usePlayerLyrics.js'

export function useAudioPlayer() {
  const audioRef = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const currentIndex = ref(0)
  const playlist = ref([])
  const currentTrack = ref(null)
  const { parsedLyrics, currentLyricIndex, loadLyric, updateLyric } = usePlayerLyrics()
  const loopMode = ref('all')
  const volume = ref(70)
  const isMuted = ref(false)
  const loadedProgress = ref(0)

  const playedProgress = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  })

  const loopModeText = computed(() => {
    const modes = { none: '不循环', all: '列表循环', one: '单曲循环' }
    return modes[loopMode.value]
  })

  function setAudioElement(el) {
    audioRef.value = el
    if (el) {
      el.volume = (volume.value ?? 70) / 100
      if (currentTrack.value?.url && (!el.src || el.src === window.location.href)) {
        el.src = currentTrack.value.url
        el.load()
      }
    }
  }

  async function loadTrack(index) {
    if (index < 0 || index >= playlist.value.length) return
    currentIndex.value = index
    const track = playlist.value[index]
    currentTrack.value = track

    if (track?.url && audioRef.value) {
      audioRef.value.preload = 'metadata'
      audioRef.value.src = track.url
      audioRef.value.load()
      currentTime.value = 0
      duration.value = track.duration || 0
    }

    await loadLyric(track)
  }

  async function playTrack(index) {
    if (currentIndex.value !== index || !currentTrack.value) {
      await loadTrack(index)
    }
    await play()
  }

  async function play() {
    if (!audioRef.value) {
      console.warn('音频引擎尚未就绪')
      return
    }
    const track = currentTrack.value || playlist.value[currentIndex.value]
    // 兜底：若 audio.src 未设置或与当前音轨不一致，补齐并加载
    if (track?.url && (!audioRef.value.src || audioRef.value.src === window.location.href)) {
      audioRef.value.src = track.url
      audioRef.value.load()
    }
    try {
      await audioRef.value.play()
      isPlaying.value = true
    } catch (err) {
      console.error('音频播放失败:', err)
      isPlaying.value = false
    }
  }

  function pause() {
    audioRef.value?.pause()
    isPlaying.value = false
  }

  function togglePlay() {
    isPlaying.value ? pause() : play()
  }

  function previousTrack() {
    let i = currentIndex.value - 1
    if (i < 0) i = playlist.value.length - 1
    playTrack(i)
  }

  function nextTrack() {
    let i = currentIndex.value + 1
    if (i >= playlist.value.length) i = 0
    playTrack(i)
  }

  function toggleLoop() {
    const modes = ['all', 'one', 'none']
    loopMode.value = modes[(modes.indexOf(loopMode.value) + 1) % modes.length]
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (audioRef.value) audioRef.value.muted = isMuted.value
  }

  function handleVolumeChange() {
    if (audioRef.value) {
      audioRef.value.volume = (volume.value ?? 0) / 100
      isMuted.value = false
    }
  }

  function seek(percent) {
    const clamped = Math.min(1, Math.max(0, percent))
    const newTime = clamped * (duration.value || 0)
    if (audioRef.value) audioRef.value.currentTime = newTime
  }

  function handleTimeUpdate() {
    if (!audioRef.value) return
    currentTime.value = audioRef.value.currentTime
    updateLyric(currentTime.value)

    if (audioRef.value.buffered.length > 0 && duration.value > 0) {
      const end = audioRef.value.buffered.end(audioRef.value.buffered.length - 1)
      loadedProgress.value = Math.min(100, (end / duration.value) * 100)
    }
  }

  function handleLoadedMetadata() {
    if (audioRef.value) {
      duration.value = audioRef.value.duration || duration.value
      const i = currentIndex.value
      if (playlist.value[i]) {
        playlist.value[i].duration = duration.value || 0
      }
    }
  }

  function handlePlay() {
    isPlaying.value = true
  }

  function handlePause() {
    isPlaying.value = false
  }

  function handleError(e) {
    console.error('原生音频加载错误:', audioRef.value?.error || e)
    isPlaying.value = false
  }

  function handleEnded() {
    if (loopMode.value === 'one') {
      if (audioRef.value) {
        audioRef.value.currentTime = 0
        play()
      }
    } else if (loopMode.value === 'all') {
      nextTrack()
    } else {
      if (currentIndex.value < playlist.value.length - 1) {
        nextTrack()
      } else {
        isPlaying.value = false
      }
    }
  }

  let initPromise = null

  async function init() {
    if (initPromise) return initPromise
    initPromise = (async () => {
      try {
        const data = await fetchPlaylist()
        playlist.value = data.map(toPlayerTrack)
      } catch (err) {
        console.warn('获取播放列表失败:', err.message)
        playlist.value = []
      }

      if (audioRef.value) {
        audioRef.value.volume = (volume.value ?? 70) / 100
      }

      if (playlist.value.length > 0 && !currentTrack.value) {
        await loadTrack(0)
      }
    })()
    return initPromise
  }

  function cleanup() {
    audioRef.value?.pause()
  }

  return {
    audioRef,
    setAudioElement,
    isPlaying,
    currentTime,
    duration,
    currentIndex,
    playlist,
    currentTrack,
    parsedLyrics,
    currentLyricIndex,
    loopMode,
    loopModeText,
    volume,
    isMuted,
    playedProgress,
    loadedProgress,
    init,
    cleanup,
    play,
    pause,
    togglePlay,
    playTrack,
    previousTrack,
    nextTrack,
    toggleLoop,
    toggleMute,
    handleVolumeChange,
    seek,
    handleTimeUpdate,
    handleLoadedMetadata,
    handlePlay,
    handlePause,
    handleError,
    handleEnded
  }
}

let sharedPlayer = null
let activeConsumers = 0

export function useSharedAudioPlayer() {
  if (!sharedPlayer) {
    sharedPlayer = useAudioPlayer()
  }
  return {
    ...sharedPlayer,
    mountConsumer(audioEl) {
      activeConsumers++
      if (audioEl && !sharedPlayer.audioRef.value) {
        sharedPlayer.setAudioElement(audioEl)
      }
      return sharedPlayer.init()
    },
    unmountConsumer(audioEl) {
      activeConsumers = Math.max(0, activeConsumers - 1)
      if (audioEl && sharedPlayer.audioRef.value === audioEl) {
        sharedPlayer.audioRef.value = null
      }
      if (activeConsumers === 0) {
        sharedPlayer.cleanup()
      }
    }
  }
}
