<template>
  <div ref="container" class="music-player-container" :class="ambient ? 'music-player--ambient' : 'surface'">
    <div v-if="ambient" class="ambient-player">
      <div class="ambient-player__row">
        <button class="ambient-player__play" type="button" :aria-label="player.isPlaying.value ? '暂停' : '播放'" :disabled="!player.currentTrack.value" @click="player.togglePlay">
          <svg v-if="!player.isPlaying.value" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M9 5v14l10-7z" /></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 5h3v14H7zm7 0h3v14h-3z" /></svg>
        </button>
        <div class="ambient-player__track">
          <span class="ambient-player__title">{{ player.currentTrack.value?.title || '音乐加载中' }}</span>
          <span class="ambient-player__artist">{{ player.currentTrack.value?.artist || '稍候片刻' }}</span>
        </div>
        <button class="ambient-player__button" type="button" aria-label="下一曲" :disabled="!player.currentTrack.value" @click="player.nextTrack">
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" /></svg>
        </button>
        <button ref="detailsToggle" class="ambient-player__button ambient-player__playlist" type="button" aria-label="播放列表" :title="showDetails ? '收起播放列表' : '展开播放列表'" :aria-expanded="showDetails" aria-controls="music-details" @click="toggleDetails">
          <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          <span>歌单</span>
        </button>
      </div>
      <div class="ambient-player__timeline">
        <span>{{ formatTime(player.currentTime.value) }}</span>
        <input class="ambient-player__progress" type="range" min="0" max="100" step="0.1" :value="player.playedProgress.value" :disabled="!player.duration.value" aria-label="播放进度" :aria-valuetext="`${formatTime(player.currentTime.value)} / ${formatTime(player.duration.value)}`" :style="{ '--played': `${player.playedProgress.value}%` }" @input="player.seek(Number($event.target.value) / 100)" />
        <span>{{ formatTime(player.duration.value) }}</span>
      </div>
    </div>

    <Teleport v-if="ambient && lyricsTarget" :to="lyricsTarget" defer>
      <MusicLyrics v-if="player.isPlaying.value || player.currentTime.value > 0" ambient :lyrics="player.parsedLyrics.value" :active-index="player.currentLyricIndex.value" :has-track="Boolean(player.currentTrack.value)" />
    </Teleport>

    <div v-else class="player-header" @click="toggleMinimize">
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
    
    <Transition name="music-panel">
    <div v-if="!ambient || showDetails" :id="ambient ? 'music-details' : undefined" class="collapse-wrapper" :class="{ 'is-collapsed': !ambient && isMinimized, 'ambient-details': ambient }" :role="ambient ? 'region' : undefined" :aria-label="ambient ? '播放列表与音乐控制' : undefined">
      <div class="collapse-inner">
        <div v-if="ambient" class="ambient-details__header">
          <span>播放列表 <span class="ambient-details__count">{{ player.playlist.value.length }}</span></span>
          <button ref="detailsClose" type="button" aria-label="收起播放列表" @click="closeDetails(true)">关闭 <span aria-hidden="true">×</span></button>
        </div>
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
            @update:volume="player.handleVolumeChange"
            @toggle-play="player.togglePlay"
            @previous="player.previousTrack"
            @next="player.nextTrack"
            @toggle-loop="player.toggleLoop"
            @toggle-mute="player.toggleMute"
            @seek="player.seek"
          />

          <!-- 歌词视窗 -->
          <MusicLyrics
            v-if="!ambient"
            :lyrics="player.parsedLyrics.value"
            :active-index="player.currentLyricIndex.value"
            :has-track="Boolean(player.currentTrack.value)"
          />

          <!-- 播放列表抽屉 -->
          <MusicPlaylist
            :collapsible="!ambient"
            :playlist="player.playlist.value"
            :current-index="player.currentIndex.value"
            :is-playing="player.isPlaying.value"
            @select-track="player.playTrack"
          />
        </div>
      </div>
    </div>
    </Transition>

    <!-- 隐藏式原生音频引擎 -->
    <audio 
      ref="nativeAudio" 
      preload="none" 
      @timeupdate="player.handleTimeUpdate" 
      @loadedmetadata="player.handleLoadedMetadata" 
      @play="player.handlePlay"
      @pause="player.handlePause"
      @error="player.handleError"
      @ended="player.handleEnded"
    ></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAudioPlayer } from '../composables/useAudioPlayer.js'
import { useMusicDetails } from '../composables/useMusicDetails.js'
import { formatTime } from '../lib/format.js'
import MusicControls from './music/MusicControls.vue'
import MusicLyrics from './music/MusicLyrics.vue'
import MusicPlaylist from './music/MusicPlaylist.vue'

defineProps({
  ambient: { type: Boolean, default: false },
  lyricsTarget: { type: String, default: '' }
})
const nativeAudio = ref(null)
const isMinimized = ref(false)

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}

const player = useAudioPlayer()

onMounted(() => {
  if (nativeAudio.value) player.setAudioElement(nativeAudio.value)
  player.init()
})
onUnmounted(player.cleanup)

const { container, detailsToggle, detailsClose, showDetails, closeDetails, toggleDetails } = useMusicDetails()
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
.music-player--ambient {
  position: relative;
  isolation: isolate;
  overflow: visible;
  color: #f6fcff;
  text-shadow: none;
}
.ambient-player {
  position: relative;
  padding: 12px 18px 13px;
  background: linear-gradient(140deg, rgba(16, 42, 54, 0.2) 0%, rgba(8, 24, 34, 0.5) 100%);
  border: 1px solid rgba(225, 245, 255, 0.22);
  border-radius: 20px;
  backdrop-filter: blur(12px) saturate(145%);
  -webkit-backdrop-filter: blur(24px) saturate(145%);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.38),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 14px 36px -6px rgba(6, 20, 28, 0.38);
  transition: background 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
}
.ambient-player:hover {
  background: linear-gradient(140deg, rgba(20, 50, 64, 0.24) 0%, rgba(10, 28, 38, 0.54) 100%);
  border-color: rgba(225, 245, 255, 0.34);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.48),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 18px 42px -6px rgba(6, 20, 28, 0.45);
}
.ambient-player__row { display: flex; align-items: center; gap: 14px; }
.ambient-player__play, .ambient-player__button { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; }
.ambient-player__play {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 4px 12px rgba(6, 20, 28, 0.2);
  transition: background 180ms ease, transform 180ms ease, border-color 180ms ease;
}
.ambient-player__play:hover {
  background: rgba(255, 255, 255, 0.24);
  border-color: #ffffff;
  transform: scale(1.05);
}
.ambient-player__play:active {
  transform: scale(0.96);
}
.ambient-player__button {
  width: 30px;
  height: 36px;
  opacity: 0.85;
  transition: opacity 180ms ease, transform 180ms ease;
}
.ambient-player__button:hover {
  opacity: 1;
  transform: translateY(-1px);
}
.ambient-player__playlist {
  width: auto;
  gap: 6px;
  font-size: 0.74rem;
  padding: 4px 11px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.ambient-player__playlist:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.32);
}
.ambient-player__play:disabled, .ambient-player__button:disabled { cursor: default; opacity: 0.35; transform: none; }
.ambient-player__track { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.ambient-player__title { font-size: 0.94rem; font-weight: 600; color: #ffffff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; letter-spacing: 0.01em; }
.ambient-player__artist { font-size: 0.76rem; color: rgba(215, 238, 248, 0.78); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.ambient-player__timeline { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 0.68rem; font-variant-numeric: tabular-nums; color: rgba(215, 238, 248, 0.75); }
.ambient-player__progress { display: block; flex: 1; min-width: 0; appearance: none; -webkit-appearance: none; width: 100%; height: 16px; margin: 0; padding: 0; cursor: pointer; color: inherit; background: transparent; }
.ambient-player__progress::-webkit-slider-runnable-track { height: 2.5px; border-radius: 2px; background: linear-gradient(to right, rgba(255, 255, 255, 0.92) var(--played), rgba(255, 255, 255, 0.18) var(--played)); }
.ambient-player__progress::-moz-range-track { height: 2.5px; border-radius: 2px; background: rgba(255, 255, 255, 0.18); }
.ambient-player__progress::-moz-range-progress { height: 2.5px; background: rgba(255, 255, 255, 0.92); }
.ambient-player__progress::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 8px; height: 8px; margin-top: -2.75px; border: 0; border-radius: 50%; background: #ffffff; box-shadow: 0 0 6px rgba(255, 255, 255, 0.8); }
.ambient-player__progress::-moz-range-thumb { width: 8px; height: 8px; border: 0; border-radius: 50%; background: #ffffff; box-shadow: 0 0 6px rgba(255, 255, 255, 0.8); }
.ambient-details {
  position: fixed;
  bottom: 170px;
  left: clamp(36px, 7vw, 140px);
  width: min(420px, 88vw);
  height: min(620px, calc(100vh - 270px));
  height: min(620px, calc(100svh - 270px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--fg);
  background: linear-gradient(160deg, rgba(16, 38, 50, 0.2) 0%, rgba(8, 22, 30, 0.5) 100%);
  border: 1px solid rgba(225, 245, 255, 0.18);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(12px) saturate(135%);
  -webkit-backdrop-filter: blur(24px) saturate(135%);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 24px 60px -12px rgba(79, 85, 88, 0.45);
  text-shadow: none;
  transform-origin: 30% bottom;
}
.ambient-details .collapse-inner { min-height: 0; display: flex; flex-direction: column; }
.ambient-details .player-body { flex: 1; min-height: 0; padding-top: 18px; }
.ambient-details .now-playing { flex-shrink: 0; padding: 0 4px; background: none; border: 0; box-shadow: none; }
.ambient-details .track-cover { width: 48px; height: 48px; }
.ambient-details :deep(.player-controls) { flex-shrink: 0; padding-bottom: 14px; border-bottom: 1px solid rgba(224, 244, 252, 0.12); }
.ambient-details__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 16px 20px 14px;
  font-size: 0.84rem;
  color: var(--fg);
  background: rgba(255, 255, 255, 0.035);
  border-bottom: 1px solid rgba(225, 245, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.ambient-details__count { margin-left: 8px; font-size: 0.72rem; color: var(--fg-muted); }
.ambient-details__header button {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-pill);
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  font-size: 0.76rem;
  color: var(--fg-muted);
  transition: all var(--dur-fast) ease;
}
.ambient-details__header button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.28);
}
.ambient-details__header button span { margin-left: 4px; font-size: 0.95rem; }
.music-panel-enter-active { transition: opacity 280ms ease, transform 380ms cubic-bezier(0.16, 1, 0.3, 1); }
.music-panel-leave-active { pointer-events: none; transition: opacity 180ms ease, transform 220ms ease; }
.music-panel-enter-from, .music-panel-leave-to { opacity: 0; transform: translateY(16px) scale(0.975); }
@media (max-width: 768px) {
  .ambient-details { left: 7%; bottom: 230px; height: min(570px, calc(100vh - 320px)); height: min(570px, calc(100svh - 320px)); }
}
@media (prefers-reduced-motion: reduce) {
  .music-panel-enter-active, .music-panel-leave-active { transition: none; }
}
</style>
