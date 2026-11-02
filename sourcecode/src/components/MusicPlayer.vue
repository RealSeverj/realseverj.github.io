<template>
  <div
    ref="container"
    class="music-player-container"
    :class="ambient ? 'music-player--ambient' : 'music-section'"
  >
    <!-- 首屏左下角：极简沉浸播放器 -->
    <div v-if="ambient" class="ambient-player">
      <div class="ambient-player__row">
        <button
          class="ambient-player__play"
          type="button"
          :aria-label="player.isPlaying.value ? '暂停' : '播放'"
          :disabled="!player.currentTrack.value"
          @click="player.togglePlay"
        >
          <svg v-if="!player.isPlaying.value" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M9 5v14l10-7z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M7 5h3v14H7zm7 0h3v14h-3z" />
          </svg>
        </button>

        <a class="ambient-player__track" href="#music" title="前往下方音乐歌单">
          <span class="ambient-player__title">{{ player.currentTrack.value?.title || '音乐加载中' }}</span>
          <span class="ambient-player__artist">{{ player.currentTrack.value?.artist || '稍候片刻' }}</span>
        </a>

        <button
          class="ambient-player__button"
          type="button"
          aria-label="上一曲"
          title="上一曲"
          :disabled="!player.currentTrack.value"
          @click="player.previousTrack"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        <button
          class="ambient-player__button"
          type="button"
          aria-label="下一曲"
          title="下一曲"
          :disabled="!player.currentTrack.value"
          @click="player.nextTrack"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <path fill="currentColor" d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" />
          </svg>
        </button>

        <a
          class="ambient-player__button ambient-player__jump"
          href="#music"
          aria-label="查看音乐歌单"
          title="查看下方音乐歌单"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h10"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </a>
      </div>

      <div class="ambient-player__timeline">
        <span>{{ formatTime(player.currentTime.value) }}</span>
        <input
          class="ambient-player__progress"
          type="range"
          min="0"
          max="100"
          step="0.1"
          :value="player.playedProgress.value"
          :disabled="!player.duration.value"
          aria-label="播放进度"
          :aria-valuetext="`${formatTime(player.currentTime.value)} / ${formatTime(player.duration.value)}`"
          :style="{ '--played': `${player.playedProgress.value}%` }"
          @input="player.seek(Number($event.target.value) / 100)"
        />
        <span>{{ formatTime(player.duration.value) }}</span>
      </div>
    </div>

    <Teleport v-if="ambient && lyricsTarget" :to="lyricsTarget" defer>
      <MusicLyrics
        v-if="player.isPlaying.value || player.currentTime.value > 0"
        ambient
        :lyrics="player.parsedLyrics.value"
        :active-index="player.currentLyricIndex.value"
        :has-track="Boolean(player.currentTrack.value)"
      />
    </Teleport>

    <!-- 主内容区：与“站点入口”并排的统一风格音乐卡片 -->
    <template v-else>
      <header class="music-section__header">
        <div class="music-section__title-group">
          <span class="music-section__badge">Music</span>
          <h2>音乐盒</h2>
        </div>
        <div class="music-section__tabs" role="tablist" aria-label="音乐视图切换">
          <button
            type="button"
            role="tab"
            class="music-tab"
            :class="{ 'is-active': activeTab === 'playlist' }"
            :aria-selected="activeTab === 'playlist'"
            @click="activeTab = 'playlist'"
          >
            歌单 <span>{{ player.playlist.value.length }}</span>
          </button>
          <button
            type="button"
            role="tab"
            class="music-tab"
            :class="{ 'is-active': activeTab === 'lyrics' }"
            :aria-selected="activeTab === 'lyrics'"
            @click="activeTab = 'lyrics'"
          >
            歌词
          </button>
        </div>
      </header>

      <div class="player-body">
        <!-- 顶部无框平铺控制区：封面 + 曲目 + 播放按钮同一行，下方紧跟进度条 -->
        <div class="player-stage">
          <div class="now-playing">
            <div class="track-cover">
              <img
                v-if="player.currentTrack.value?.cover"
                :src="player.currentTrack.value.cover"
                alt="封面"
              />
              <svg v-else viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
            </div>

            <div class="track-info">
              <div class="track-name">{{ player.currentTrack.value?.title || '音乐加载中' }}</div>
              <div class="track-artist">
                {{ player.currentTrack.value?.artist || '稍候片刻' }}
                <template v-if="player.currentTrack.value?.album">
                  · {{ player.currentTrack.value.album }}
                </template>
              </div>
            </div>

            <div class="inline-controls">
              <button
                type="button"
                class="control-btn"
                title="上一曲"
                aria-label="上一曲"
                :disabled="!player.currentTrack.value"
                @click="player.previousTrack"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
                </svg>
              </button>

              <button
                type="button"
                class="control-btn play-btn"
                :title="player.isPlaying.value ? '暂停' : '播放'"
                :aria-label="player.isPlaying.value ? '暂停' : '播放'"
                :disabled="!player.currentTrack.value"
                @click="player.togglePlay"
              >
                <svg v-if="!player.isPlaying.value" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              </button>

              <button
                type="button"
                class="control-btn"
                title="下一曲"
                aria-label="下一曲"
                :disabled="!player.currentTrack.value"
                @click="player.nextTrack"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M16 6h2v12h-2V6zM6 6l8.5 6L6 18V6z" />
                </svg>
              </button>

              <button
                type="button"
                class="control-btn"
                :class="{ active: player.loopMode.value !== 'none' }"
                :title="player.loopModeText.value"
                :aria-label="player.loopModeText.value"
                @click="player.toggleLoop"
              >
                <svg v-if="player.loopMode.value === 'one'" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path fill="currentColor" d="M7 7h7v3l4-4-4-4v3H5v6h2V7zm10 10H10v-3l-4 4 4 4v-3h9v-6h-2v4zM12 9h2v6h-2z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                  <path fill="currentColor" d="M7 7h7v3l4-4-4-4v3H5v6h2V7zm10 10H10v-3l-4 4 4 4v-3h9v-6h-2v4z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="progress-section">
            <span class="time-current">{{ formatTime(player.currentTime.value) }}</span>
            <div class="progress-bar" @click="handleProgressClick">
              <div class="progress-loaded" :style="{ width: player.loadedProgress.value + '%' }"></div>
              <div class="progress-played" :style="{ width: player.playedProgress.value + '%' }">
                <span class="progress-thumb"></span>
              </div>
            </div>
            <span class="time-duration">{{ formatTime(player.duration.value) }}</span>
          </div>
        </div>

        <!-- 播放列表 / 歌词视窗 -->
        <div class="player-pane">
          <MusicPlaylist
            v-show="activeTab === 'playlist'"
            :collapsible="false"
            :playlist="player.playlist.value"
            :current-index="player.currentIndex.value"
            :is-playing="player.isPlaying.value"
            @select-track="player.playTrack"
          />
          <MusicLyrics
            v-if="activeTab === 'lyrics'"
            :lyrics="player.parsedLyrics.value"
            :active-index="player.currentLyricIndex.value"
            :has-track="Boolean(player.currentTrack.value)"
          />
        </div>
      </div>
    </template>

    <!-- 全局唯一原生音频引擎（仅由首屏 ambient 实例挂载） -->
    <audio
      v-if="ambient"
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
import { useSharedAudioPlayer } from '../composables/useAudioPlayer.js'
import { formatTime } from '../lib/format.js'
import MusicLyrics from './music/MusicLyrics.vue'
import MusicPlaylist from './music/MusicPlaylist.vue'

defineProps({
  ambient: { type: Boolean, default: false },
  lyricsTarget: { type: String, default: '' }
})

const container = ref(null)
const nativeAudio = ref(null)
const activeTab = ref('playlist')

const player = useSharedAudioPlayer()

function handleProgressClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  player.seek(percent)
}

onMounted(() => {
  player.mountConsumer(nativeAudio.value)
})

onUnmounted(() => {
  player.unmountConsumer(nativeAudio.value)
})
</script>

<style scoped>
/* ============================================================================
   主内容区音乐卡片（与 LinkSection 保持完全一致的视觉规范）
   ============================================================================ */
.music-section {
  scroll-margin-top: 96px;
  display: flex;
  flex-direction: column;
  padding: clamp(1.5rem, 3vw, 2.1rem);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border);
  background: var(--surface-flat);
  backdrop-filter: var(--blur-lg) saturate(130%);
  -webkit-backdrop-filter: var(--blur-lg) saturate(130%);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: transform var(--dur-base) ease, box-shadow var(--dur-base) ease, border-color var(--dur-base) ease;
  overflow: hidden;
}

.music-section:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.38),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.music-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.music-section__title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.music-section__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.36rem 0.85rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--fg-muted);
  font-size: 0.76rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.music-section__header h2 {
  margin: 0;
  font-size: clamp(1.35rem, 2.6vw, 1.75rem);
  font-weight: 600;
  line-height: 1.15;
  color: #ffffff;
  letter-spacing: -0.015em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

.music-section__tabs {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.music-tab {
  padding: 4px 11px;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--fg-muted);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--dur-fast) ease, color var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
}

.music-tab span {
  margin-left: 3px;
  font-size: 0.72rem;
  opacity: 0.75;
}

.music-tab:hover {
  color: #ffffff;
}

.music-tab.is-active {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.player-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 无边框平铺控制区，仅保留底部柔和分割线 */
.player-stage {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding-bottom: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.now-playing {
  display: flex;
  gap: 11px;
  align-items: center;
}

.track-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
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
  font-size: 0.92rem;
  font-weight: 600;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.track-artist {
  font-size: 0.76rem;
  color: var(--fg-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-controls {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.control-btn {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--fg);
  cursor: pointer;
  padding: 0;
  transition: background var(--dur-fast) ease, border-color var(--dur-fast) ease, transform var(--dur-fast) ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}

.control-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.32);
}

.play-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 3px 10px rgba(0, 0, 0, 0.16);
}

.play-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.45);
  transform: scale(1.04);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-current,
.time-duration {
  font-size: 0.72rem;
  color: var(--fg-subtle);
  font-variant-numeric: tabular-nums;
  min-width: 32px;
}

.time-duration {
  text-align: right;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  cursor: pointer;
  position: relative;
}

.progress-loaded {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: inherit;
  transition: width 0.3s ease;
}

.progress-played {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.65);
  border-radius: inherit;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

.player-pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.player-pane :deep(.lyrics-display) {
  flex: 1;
  max-height: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.player-pane :deep(.lyrics-scroll) {
  max-height: 100%;
}

/* ============================================================================
   首屏 Ambient 迷你播放器
   ============================================================================ */
.music-player--ambient {
  position: relative;
  overflow: visible;
  color: #f6fcff;
  text-shadow: none;
}

.ambient-player {
  position: relative;
  padding: 12px 18px 13px;
  background: linear-gradient(145deg, rgba(240, 250, 255, 0.14) 0%, rgba(210, 236, 248, 0.06) 100%);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 20px;
  backdrop-filter: blur(8px) saturate(108%);
  -webkit-backdrop-filter: blur(8px) saturate(108%);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 6px 20px -6px rgba(10, 32, 44, 0.14);
  opacity: var(--intro-opacity, 1);
  transform: translate3d(0, calc(var(--scene-progress, 0) * -14px), 0);
  transition: background var(--dur-base) ease, border-color var(--dur-base) ease, box-shadow var(--dur-base) ease;
}

.ambient-player:hover {
  background: linear-gradient(145deg, rgba(245, 252, 255, 0.2) 0%, rgba(215, 240, 250, 0.1) 100%);
  border-color: rgba(255, 255, 255, 0.34);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.42),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 10px 26px -6px rgba(10, 32, 44, 0.18);
}

.ambient-player__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ambient-player__play,
.ambient-player__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.ambient-player__play {
  width: 42px;
  height: 42px;
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
  height: 34px;
  border-radius: var(--radius-xs);
  opacity: 0.82;
  transition: opacity 180ms ease, transform 180ms ease, background 180ms ease;
}

.ambient-player__button:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.ambient-player__jump {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.ambient-player__jump:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.34);
}

.ambient-player__play:disabled,
.ambient-player__button:disabled {
  cursor: default;
  opacity: 0.35;
  transform: none;
}

.ambient-player__track {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-right: 2px;
  transition: opacity 180ms ease;
}

.ambient-player__track:hover {
  opacity: 0.88;
}

.ambient-player__title {
  font-size: 0.94rem;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 5px rgba(12, 38, 52, 0.32);
}

.ambient-player__artist {
  font-size: 0.76rem;
  color: rgba(235, 248, 255, 0.88);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-shadow: 0 1px 4px rgba(12, 38, 52, 0.28);
}

.ambient-player__timeline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  color: rgba(235, 248, 255, 0.85);
  text-shadow: 0 1px 4px rgba(12, 38, 52, 0.28);
}

.ambient-player__progress {
  display: block;
  flex: 1;
  min-width: 0;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 16px;
  margin: 0;
  padding: 0;
  cursor: pointer;
  color: inherit;
  background: transparent;
}

.ambient-player__progress::-webkit-slider-runnable-track {
  height: 2.5px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.92) var(--played),
    rgba(255, 255, 255, 0.18) var(--played)
  );
}

.ambient-player__progress::-moz-range-track {
  height: 2.5px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.18);
}

.ambient-player__progress::-moz-range-progress {
  height: 2.5px;
  background: rgba(255, 255, 255, 0.92);
}

.ambient-player__progress::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 8px;
  height: 8px;
  margin-top: -2.75px;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.ambient-player__progress::-moz-range-thumb {
  width: 8px;
  height: 8px;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}
</style>
