<template>
  <div class="music-player-container surface">
    <div class="player-header" @click="toggleMinimize">
      <svg class="header-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
      </svg>
      <span>音乐播放器</span>
      <button 
        @click.stop="toggleMinimize" 
        class="minimize-btn" 
        :class="{ 'is-rotated': isMinimized }"
        :title="isMinimized ? '展开' : '收起'"
        type="button"
        aria-label="切换音乐播放器折叠状态"
      >
        <svg class="chevron-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>
    
    <!-- 丝滑折叠外层（CSS Grid 0fr <-> 1fr 硬件加速） -->
    <div class="collapse-wrapper" :class="{ 'is-collapsed': isMinimized }">
      <div class="collapse-inner">
        <div class="player-body">
          <!-- 当前播放信息 -->
          <div v-if="player.currentTrack.value" class="now-playing">
            <div class="track-cover">
              <img v-if="player.currentTrack.value.cover" :src="player.currentTrack.value.cover" alt="封面" />
              <svg v-else viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
              </svg>
            </div>
            <div class="track-info">
              <div class="track-name">{{ player.currentTrack.value.title }}</div>
              <div class="track-artist">{{ player.currentTrack.value.artist }}</div>
              <div class="track-album" v-if="player.currentTrack.value.album">{{ player.currentTrack.value.album }}</div>
            </div>
          </div>

          <!-- 播放控制条 -->
          <MusicControls
            :is-playing="player.isPlaying.value"
            :current-time="player.currentTime.value"
            :duration="player.duration.value"
            :played-progress="player.playedProgress.value"
            :loaded-progress="player.loadedProgress.value"
            :loop-mode="player.loopMode.value"
            :loop-mode-text="player.loopModeText.value"
            :is-muted="player.isMuted.value"
            v-model:volume="player.volume.value"
            @toggle-play="player.togglePlay"
            @previous="player.previousTrack"
            @next="player.nextTrack"
            @toggle-loop="player.toggleLoop"
            @toggle-mute="player.toggleMute"
            @seek="player.seek"
          />

          <!-- 歌词视窗 -->
          <MusicLyrics
            :lyrics="player.parsedLyrics.value"
            :active-index="player.currentLyricIndex.value"
            :has-track="Boolean(player.currentTrack.value)"
          />

          <!-- 播放列表抽屉 -->
          <MusicPlaylist
            :playlist="player.playlist.value"
            :current-index="player.currentIndex.value"
            :is-playing="player.isPlaying.value"
            @select-track="player.playTrack"
          />
        </div>
      </div>
    </div>

    <!-- 隐藏式原生音频引擎 -->
    <audio 
      :ref="player.audioRef" 
      preload="none" 
      @timeupdate="player.handleTimeUpdate" 
      @loadedmetadata="player.handleLoadedMetadata" 
      @ended="player.handleEnded"
    ></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudioPlayer } from '../composables/useAudioPlayer'
import MusicControls from './music/MusicControls.vue'
import MusicLyrics from './music/MusicLyrics.vue'
import MusicPlaylist from './music/MusicPlaylist.vue'

const isMinimized = ref(false)
function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}

const player = useAudioPlayer()

onMounted(() => {
  player.init()
})

onUnmounted(() => {
  player.cleanup()
})
</script>

<style scoped>
.music-player-container {
  overflow: hidden;
  transition: border-radius var(--dur-base) ease;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--surface-header);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--fg);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: background var(--dur-fast) ease;
}

.player-header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.header-icon {
  opacity: 0.85;
}

.minimize-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--fg-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-xs);
  transition: color var(--dur-base) ease, background var(--dur-base) ease;
}

.minimize-btn:hover { 
  background: rgba(255, 255, 255, 0.12); 
  color: #ffffff; 
}

.chevron-icon {
  display: block;
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.minimize-btn.is-rotated .chevron-icon {
  transform: rotate(-180deg);
}

/* 现代丝滑折叠器容器：0fr <-> 1fr 动画 */
.collapse-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 340ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease;
  opacity: 1;
}

.collapse-wrapper.is-collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
}

.collapse-inner {
  min-height: 0;
  overflow: hidden;
}

.player-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.now-playing {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.track-cover {
  width: 58px; 
  height: 58px; 
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: flex; 
  align-items: center; 
  justify-content: center;
  overflow: hidden; 
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s ease;
}

.track-cover img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}

.track-cover svg { 
  color: var(--fg-subtle); 
  opacity: 0.6;
}

.track-info { 
  flex: 1; 
  min-width: 0; 
}

.track-name {
  font-size: 0.98rem; 
  font-weight: 600; 
  color: #ffffff;
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  margin-bottom: 3px;
}

.track-artist { 
  font-size: 0.84rem; 
  color: var(--fg-muted); 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

.track-album { 
  font-size: 0.78rem; 
  color: var(--fg-subtle); 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  margin-top: 2px; 
}
</style>
