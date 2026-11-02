<template>
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
      <button @click="$emit('previous')" class="control-btn" title="上一曲">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>
      </button>
      <button @click="$emit('toggle-play')" class="control-btn play-btn" :title="isPlaying ? '暂停' : '播放'">
        <svg v-if="!isPlaying" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
      </button>
      <button @click="$emit('next')" class="control-btn" title="下一曲">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16 6h2v12h-2V6zM6 6l8.5 6L6 18V6z"/></svg>
      </button>
      <button @click="$emit('toggle-loop')" class="control-btn" :class="{ active: loopMode !== 'none' }" :title="loopModeText">
        <svg v-if="loopMode === 'one'" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 7h7v3l4-4-4-4v3H5v6h2V7zm10 10H10v-3l-4 4 4 4v-3h9v-6h-2v4zM12 9h2v6h-2z"/></svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 7h7v3l4-4-4-4v3H5v6h2V7zm10 10H10v-3l-4 4 4 4v-3h9v-6h-2v4z"/></svg>
      </button>
      <div class="volume-control">
        <button @click="$emit('toggle-mute')" class="control-btn" title="音量">
          <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm12.5 3l2.5 2.5 1.5-1.5L18 10.5 20.5 8 19 6.5 16.5 9 14 6.5 12.5 8 15 10.5 12.5 13 14 14.5 16.5 12z"/></svg>
          <svg v-else-if="volume < 50" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm9 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 13 12z"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm9 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 13 12zm0-8v2a8 8 0 0 1 0 12v2a10 10 0 0 0 0-16z"/></svg>
        </button>
        <div class="volume-slider">
          <input 
            type="range" min="0" max="100" aria-label="音量"
            :value="volume" 
            @input="$emit('update:volume', Number($event.target.value))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTime } from '../../lib/format.js'

const props = defineProps({
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  playedProgress: { type: Number, default: 0 },
  loadedProgress: { type: Number, default: 0 },
  loopMode: { type: String, default: 'all' },
  loopModeText: { type: String, default: '列表循环' },
  volume: { type: Number, default: 70 },
  isMuted: { type: Boolean, default: false }
})

const emit = defineEmits([
  'toggle-play',
  'previous',
  'next',
  'toggle-loop',
  'toggle-mute',
  'seek',
  'update:volume'
])

function handleProgressClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  emit('seek', percent)
}
</script>

<style scoped>
.player-controls { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.progress-section { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}

.time-current, .time-duration {
  font-size: 0.78rem; 
  color: var(--fg-subtle);
  font-variant-numeric: tabular-nums; 
  min-width: 36px;
}

.progress-bar {
  flex: 1; 
  height: 5px; 
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px; 
  cursor: pointer; 
  position: relative; 
  overflow: visible;
}

.progress-loaded {
  position: absolute; 
  left: 0; 
  top: 0; 
  height: 100%;
  background: rgba(255, 255, 255, 0.2); 
  border-radius: 4px; 
  transition: width 0.3s ease; 
  z-index: 1;
}

.progress-played {
  position: absolute; 
  left: 0; 
  top: 0; 
  height: 100%;
  background: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  border-radius: 4px; 
  transition: width 0.1s linear; 
  z-index: 2;
}

.progress-thumb {
  position: absolute; 
  right: -5px; 
  top: 50%; 
  transform: translateY(-50%);
  width: 10px; 
  height: 10px; 
  background: #ffffff;
  border-radius: 50%; 
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.9); 
  z-index: 3; 
  pointer-events: none;
}

.control-buttons { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 8px; 
}

.control-btn {
  width: 36px; 
  height: 36px; 
  aspect-ratio: 1 / 1;
  border-radius: 50%; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center;
  background: rgba(255, 255, 255, 0.08); 
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--fg); 
  cursor: pointer; 
  transition: all 0.2s ease; 
  padding: 0;
}

.control-btn:hover { 
  background: rgba(255, 255, 255, 0.16); 
  border-color: rgba(255, 255, 255, 0.3); 
  transform: translateY(-1px); 
}

.control-btn.active { 
  background: rgba(255, 255, 255, 0.22); 
  color: #ffffff; 
  border-color: rgba(255, 255, 255, 0.4);
}

.control-btn svg { 
  display: block; 
}

.play-btn { 
  width: 44px; 
  height: 44px; 
  aspect-ratio: 1 / 1;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.play-btn:hover { 
  background: rgba(255, 255, 255, 0.24); 
  border-color: rgba(255, 255, 255, 0.45);
  transform: translateY(-1px) scale(1.04);
}

.volume-control { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  margin-left: 6px; 
}

.volume-slider { 
  width: 74px; 
}

.volume-slider input[type="range"] {
  width: 100%; 
  height: 4px; 
  background: rgba(255, 255, 255, 0.15); 
  border-radius: 2px; 
  outline: none; 
  -webkit-appearance: none; 
  appearance: none;
}

.volume-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; 
  width: 10px; 
  height: 10px; 
  background: #ffffff;
  border-radius: 50%; 
  cursor: pointer;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.volume-slider input[type="range"]::-moz-range-thumb {
  width: 10px; 
  height: 10px; 
  background: #ffffff;
  border-radius: 50%; 
  cursor: pointer; 
  border: none;
}

@media (max-width: 768px) {
  .volume-control { display: none; }
}
</style>

