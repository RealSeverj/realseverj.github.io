<template>
  <div class="music-player-container">
    <div class="player-header">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
      </svg>
      <span>音乐播放器</span>
      <button @click="toggleMinimize" class="minimize-btn" :title="isMinimized ? '展开' : '收起'">
        <svg v-if="isMinimized" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 14l5-5 5 5z"/></svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
      </button>
    </div>
    
    <div v-show="!isMinimized" class="player-body">
      <!-- 当前播放信息 -->
      <div v-if="currentTrack" class="now-playing">
        <div class="track-cover">
          <img v-if="currentTrack.cover" :src="currentTrack.cover" alt="封面" />
          <svg v-else viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="track-info">
          <div class="track-name">{{ currentTrack.title }}</div>
          <div class="track-artist">{{ currentTrack.artist }}</div>
          <div class="track-album" v-if="currentTrack.album">{{ currentTrack.album }}</div>
        </div>
      </div>

      <!-- 播放控制 -->
      <div class="player-controls">
        <div class="progress-section">
          <span class="time-current">{{ formatTime(currentTime) }}</span>
          <div class="progress-bar" @click="handleProgressClick">
            <div class="progress-loaded" :style="{ width: loadedProgress + '%' }"></div>
            <div class="progress-played" :style="{ width: playedProgress + '%' }">
              <span class="progress-thumb"></span>
            </div>
          </div>
          <span class="time-duration">{{ formatTime(duration) }}</span>
        </div>
        
        <div class="control-buttons">
          <button @click="previousTrack" class="control-btn" title="上一曲">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button @click="togglePlay" class="control-btn play-btn" :title="isPlaying ? '暂停' : '播放'">
            <svg v-if="!isPlaying" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
          </button>
          <button @click="nextTrack" class="control-btn" title="下一曲">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16 6h2v12h-2V6zM6 6l8.5 6L6 18V6z"/></svg>
          </button>
          <button @click="toggleLoop" class="control-btn" :class="{ active: loopMode !== 'none' }" :title="loopModeText">
            <svg v-if="loopMode === 'one'" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 7h7v3l4-4-4-4v3H5v6h2V7zm10 10H10v-3l-4 4 4 4v-3h9v-6h-2v4zM12 9h2v6h-2z"/></svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 7h7v3l4-4-4-4v3H5v6h2V7zm10 10H10v-3l-4 4 4 4v-3h9v-6h-2v4z"/></svg>
          </button>
          <div class="volume-control">
            <button @click="toggleMute" class="control-btn" title="音量">
              <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm12.5 3l2.5 2.5 1.5-1.5L18 10.5 20.5 8 19 6.5 16.5 9 14 6.5 12.5 8 15 10.5 12.5 13 14 14.5 16.5 12z"/></svg>
              <svg v-else-if="volume < 50" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm9 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 13 12z"/></svg>
              <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm9 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 13 12zm0-8v2a8 8 0 0 1 0 12v2a10 10 0 0 0 0-16z"/></svg>
            </button>
            <div class="volume-slider">
              <input 
                type="range" min="0" max="100"
                v-model.number="volume" @input="handleVolumeChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 歌词显示 -->
      <div v-if="parsedLyrics.length > 0" class="lyrics-display">
        <div class="lyrics-scroll" ref="lyricsRef">
          <div 
            v-for="(line, index) in parsedLyrics" 
            :key="index"
            :class="['lyric-line', { active: currentLyricIndex === index }]"
            :data-index="index"
          >
            {{ line.text }}
          </div>
        </div>
      </div>
      
      <div v-else-if="currentTrack" class="no-lyrics">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
        </svg>
        <p>纯音乐，请欣赏</p>
      </div>

      <!-- 播放列表 -->
      <div class="playlist">
        <div class="playlist-header" @click="togglePlaylist">
          <span>播放列表 ({{ playlist.length }})</span>
          <svg v-if="showPlaylist" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 14l5-5 5 5z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div v-show="showPlaylist" class="playlist-items">
          <div 
            v-for="(track, index) in playlist" 
            :key="index"
            :class="['playlist-item', { active: currentIndex === index }]"
            @click="playTrack(index)"
          >
            <div class="item-index">{{ index + 1 }}</div>
            <div class="item-info">
              <div class="item-title">{{ track.title }}</div>
              <div class="item-artist">{{ track.artist }}</div>
            </div>
            <div class="item-duration">{{ formatTime(track.duration) }}</div>
            <svg v-if="currentIndex === index && isPlaying" class="item-playing" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M4 10h2v4H4v-4zm4-3h2v10H8V7zm4 5h2v4h-2v-4zm4-8h2v18h-2V4z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <audio ref="audioRef" @timeupdate="handleTimeUpdate" @loadedmetadata="handleLoadedMetadata" @ended="handleEnded"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { parseBlob } from 'music-metadata-browser'

async function ensureBuffer() {
  if (typeof window !== 'undefined' && !window.Buffer) {
    const { Buffer } = await import('buffer')
    window.Buffer = Buffer
  }
}

const audioRef = ref(null)
const lyricsRef = ref(null)
const isMinimized = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentIndex = ref(0)
const playlist = ref([])
const currentTrack = ref(null)
const parsedLyrics = ref([])
const currentLyricIndex = ref(-1)
const showPlaylist = ref(false)
const loopMode = ref('all')
const volume = ref(70)
const isMuted = ref(false)
const loadedProgress = ref(0)

const createdObjectUrls = []

const musicModules = import.meta.glob('../assets/mp3/*.{mp3,flac,wav,ogg}', { eager: false })
const lyricModules = import.meta.glob('../assets/mp3/*.lrc', { eager: false, query: '?raw', import: 'default' })

const playedProgress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const loopModeText = computed(() => {
  const modes = { none: '不循环', all: '列表循环', one: '单曲循环' }
  return modes[loopMode.value]
})

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function parseLyric(lrcText) {
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
      const mm = parseInt(m[1]); const ss = parseInt(m[2]); const ms = m[3] ? parseInt(m[3].padEnd(3, '0')) : 0
      result.push({ time: mm * 60 + ss + ms / 1000, text })
    }
  }
  return result.sort((a, b) => a.time - b.time)
}

function updateCurrentLyric(time) {
  if (!parsedLyrics.value.length) return
  let i = -1
  for (let k = 0; k < parsedLyrics.value.length; k++) {
    if (time >= parsedLyrics.value[k].time) i = k
    else break
  }
  if (i !== currentLyricIndex.value) {
    currentLyricIndex.value = i
    scrollToCurrentLyric()
  }
}

function scrollToCurrentLyric() {
  if (!lyricsRef.value || currentLyricIndex.value < 0) return
  const activeLine = lyricsRef.value.querySelector(`[data-index="${currentLyricIndex.value}"]`)
  if (activeLine) {
    activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

async function loadLyric(musicPath) {
  const lyricPath = musicPath.replace(/\.(mp3|flac|wav|ogg)$/i, '.lrc')
  try {
    if (lyricModules[lyricPath]) {
      const lrcText = await lyricModules[lyricPath]()
      parsedLyrics.value = parseLyric(lrcText)
    } else {
      parsedLyrics.value = []
    }
    currentLyricIndex.value = -1
  } catch (err) {
    console.error('加载歌词失败:', err)
    parsedLyrics.value = []
  }
}

async function extractMetadata(audioUrl, filePath) {
  const fileName = filePath.split('/').pop().replace(/\.(mp3|flac|wav|ogg)$/i, '')
  
  try {
    
    // 使用 audioRef 创建临时 audio 元素来获取时长
    const tempAudio = new Audio(audioUrl)
    
    // 等待元数据加载
    const duration = await new Promise((resolve) => {
      tempAudio.addEventListener('loadedmetadata', () => {
        resolve(tempAudio.duration)
      })
      tempAudio.addEventListener('error', () => {
        resolve(0)
      })
      tempAudio.load()
    })
    
    // 获取封面和其他元数据
    let cover = ''
    let title = fileName
    let artist = '未知艺术家'
    let album = ''
    
    try {
      // 确保 Buffer 可用（关键修复点）
      await ensureBuffer()

      const res = await fetch(audioUrl)
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
          createdObjectUrls.push(cover)
        }
      }
    } catch (metaError) {
      console.warn('无法读取音频标签，使用文件名:', metaError)
      // 尝试从文件名解析艺术家和标题
      const parts = fileName.split(' - ')
      if (parts.length >= 2) {
        artist = parts[0].trim()
        title = parts.slice(1).join(' - ').trim()
      }
    }
    
    return { title, artist, album, duration, cover }
  } catch (e) {
    console.error('提取元数据失败:', e)
    return { 
      title: fileName, 
      artist: '未知艺术家', 
      album: '', 
      duration: 0, 
      cover: '' 
    }
  }
}

async function initPlaylist() {
  const musicFiles = Object.keys(musicModules)
  if (!musicFiles.length) {
    console.warn('未找到音乐文件')
    return
  }
  const tracks = await Promise.all(musicFiles.map(async (path) => {
    const mod = await musicModules[path]()
    const url = mod.default
    const meta = await extractMetadata(url, path)
    return { url, path, ...meta }
  }))
  playlist.value = tracks
  if (tracks.length > 0) loadTrack(0)
}

async function loadTrack(index) {
  if (index < 0 || index >= playlist.value.length) return
  currentIndex.value = index
  currentTrack.value = playlist.value[index]
  if (audioRef.value) {
    audioRef.value.src = currentTrack.value.url
    audioRef.value.load()
    isPlaying.value = false
    currentTime.value = 0
    duration.value = currentTrack.value.duration || 0
  }
  await loadLyric(currentTrack.value.path)
}

async function playTrack(index) {
  if (currentIndex.value !== index) await loadTrack(index)
  play()
}

function play() {
  audioRef.value?.play()
  isPlaying.value = true
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

function handleProgressClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  const newTime = percent * (duration.value || 0)
  if (audioRef.value) audioRef.value.currentTime = newTime
}

function handleTimeUpdate() {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  updateCurrentLyric(currentTime.value)
  if (audioRef.value.buffered.length > 0 && duration.value > 0) {
    const end = audioRef.value.buffered.end(audioRef.value.buffered.length - 1)
    loadedProgress.value = Math.min(100, (end / duration.value) * 100)
  }
}
function handleLoadedMetadata() {
  if (audioRef.value) duration.value = audioRef.value.duration || duration.value
}
function handleEnded() {
  if (loopMode.value === 'one') {
    audioRef.value.currentTime = 0
    play()
  } else if (loopMode.value === 'all') {
    nextTrack()
  } else {
    if (currentIndex.value < playlist.value.length - 1) nextTrack()
    else isPlaying.value = false
  }
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}
function togglePlaylist() {
  showPlaylist.value = !showPlaylist.value
}

onMounted(() => {
  initPlaylist()
  if (audioRef.value) audioRef.value.volume = (volume.value ?? 70) / 100
})

onUnmounted(() => {
  audioRef.value?.pause()
  createdObjectUrls.forEach(url => URL.revokeObjectURL(url))
})
</script>

<style scoped>
.music-player-container {
  background: linear-gradient(135deg, rgba(20, 26, 54, 0.5), rgba(16, 22, 48, 0.4));
  border: 1px solid rgba(130, 156, 248, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.player-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: rgba(130, 156, 248, 0.1);
  border-bottom: 1px solid rgba(130, 156, 248, 0.2);
  color: rgba(226, 234, 255, 0.95);
  font-size: 1rem;
  font-weight: 500;
}
.player-header svg { color: rgba(130, 156, 248, 0.9); }

.minimize-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(198, 206, 240, 0.7);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.minimize-btn:hover { background: rgba(130, 156, 248, 0.15); color: rgba(226, 234, 255, 0.95); }

.player-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.now-playing {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: rgba(130, 156, 248, 0.05);
  border-radius: 12px;
}
.track-cover {
  width: 64px; height: 64px; border-radius: 8px;
  background: rgba(130, 156, 248, 0.1);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.track-cover img { width: 100%; height: 100%; object-fit: cover; }
.track-cover svg { color: rgba(130, 156, 248, 0.4); }

.track-info { flex: 1; min-width: 0; }
.track-name {
  font-size: 1.05rem; font-weight: 600; color: rgba(226, 234, 255, 0.95);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 4px;
}
.track-artist { font-size: 0.9rem; color: rgba(198, 206, 240, 0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.track-album { font-size: 0.85rem; color: rgba(173, 194, 255, 0.6); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }

.player-controls { display: flex; flex-direction: column; gap: 12px; }
.progress-section { display: flex; align-items: center; gap: 12px; }
.time-current, .time-duration {
  font-size: 0.85rem; color: rgba(198, 206, 240, 0.7);
  font-variant-numeric: tabular-nums; min-width: 40px;
}

.progress-bar {
  flex: 1; height: 6px; background: rgba(130, 156, 248, 0.15);
  border-radius: 3px; cursor: pointer; position: relative; overflow: visible;
}
.progress-loaded {
  position: absolute; left: 0; top: 0; height: 100%;
  background: rgba(130, 156, 248, 0.25); border-radius: 3px; transition: width 0.3s ease; z-index: 1;
}
.progress-played {
  position: absolute; left: 0; top: 0; height: 100%;
  background: linear-gradient(90deg, rgba(118, 255, 214, 0.8), rgba(130, 156, 248, 0.9));
  border-radius: 3px; transition: width 0.1s linear; z-index: 2;
}
.progress-thumb {
  position: absolute; right: -6px; top: 50%; transform: translateY(-50%);
  width: 12px; height: 12px; background: rgba(226, 234, 255, 0.95);
  border-radius: 50%; box-shadow: 0 0 8px rgba(118, 255, 214, 0.6); z-index: 3; pointer-events: none;
}

.control-buttons { display: flex; align-items: center; justify-content: center; gap: 8px; }
.control-btn {
  width: 36px; height: 36px; aspect-ratio: 1 / 1;
  border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
  background: rgba(130, 156, 248, 0.1); border: 1px solid rgba(130, 156, 248, 0.2);
  color: rgba(226, 234, 255, 0.9); cursor: pointer; transition: all 0.2s ease; padding: 0;
}
.control-btn:hover { background: rgba(130, 156, 248, 0.2); border-color: rgba(173, 194, 255, 0.35); transform: translateY(-1px); }
.control-btn.active { background: rgba(130, 156, 248, 0.25); color: rgba(118, 255, 214, 0.95); }
.control-btn svg { display: block; }

.play-btn { width: 44px; height: 44px; aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, rgba(118, 255, 214, 0.2), rgba(130, 156, 248, 0.2));
  border-color: rgba(130, 156, 248, 0.3);
}
.play-btn:hover { background: linear-gradient(135deg, rgba(118, 255, 214, 0.3), rgba(130, 156, 248, 0.3)); }

.volume-control { display: flex; align-items: center; gap: 8px; margin-left: 8px; }
.volume-slider { width: 80px; }
.volume-slider input[type="range"] {
  width: 100%; height: 4px; background: rgba(130, 156, 248, 0.2); border-radius: 2px; outline: none; -webkit-appearance: none;
}
.volume-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 12px; height: 12px; background: rgba(226, 234, 255, 0.95);
  border-radius: 50%; cursor: pointer;
}
.volume-slider input[type="range"]::-moz-range-thumb {
  width: 12px; height: 12px; background: rgba(226, 234, 255, 0.95);
  border-radius: 50%; cursor: pointer; border: none;
}

.lyrics-display {
  background: rgba(130, 156, 248, 0.05);
  border-radius: 12px; padding: 16px; max-height: 200px; overflow: hidden;
}
.lyrics-scroll {
  max-height: 168px; 
  overflow-y: auto; 
  padding: 0 8px;
  overscroll-behavior: contain;
  /* 隐藏滚动条但保持功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.lyrics-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.lyric-line {
  text-align: center; padding: 6px 0; color: rgba(198, 206, 240, 0.5);
  font-size: 0.9rem; line-height: 1.5; transition: all 0.3s ease;
}
.lyric-line.active { color: rgba(226, 234, 255, 0.95); font-size: 1rem; font-weight: 500; transform: scale(1.05); }

.no-lyrics {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 32px 20px; color: rgba(198, 206, 240, 0.6); gap: 10px;
}
.no-lyrics svg { color: rgba(130, 156, 248, 0.4); }

.playlist { border-top: 1px solid rgba(130, 156, 248, 0.15); padding-top: 12px; }
.playlist-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background: rgba(130, 156, 248, 0.05);
  border-radius: 8px; cursor: pointer; color: rgba(226, 234, 255, 0.9);
  font-size: 0.95rem; font-weight: 500; transition: background 0.2s ease;
}
.playlist-header:hover { background: rgba(130, 156, 248, 0.1); }

.playlist-items { 
  margin-top: 8px; 
  max-height: 240px; 
  overflow-y: auto;
  /* 隐藏滚动条但保持功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.playlist-items::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.playlist-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border-radius: 8px; cursor: pointer; transition: background 0.2s ease;
}
.playlist-item:hover { background: rgba(130, 156, 248, 0.08); }
.playlist-item.active { background: rgba(130, 156, 248, 0.12); }
.item-index { width: 24px; text-align: center; font-size: 0.85rem; color: rgba(198, 206, 240, 0.6); }
.item-info { flex: 1; min-width: 0; }
.item-title { font-size: 0.9rem; color: rgba(226, 234, 255, 0.9); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-artist { font-size: 0.8rem; color: rgba(198, 206, 240, 0.6); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
.item-duration { font-size: 0.85rem; color: rgba(198, 206, 240, 0.6); font-variant-numeric: tabular-nums; }
.item-playing { color: rgba(118, 255, 214, 0.9); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

@media (max-width: 768px) {
  .volume-control { display: none; }
  .lyrics-display { max-height: 160px; }
  .lyrics-scroll { max-height: 128px; }
}
</style>