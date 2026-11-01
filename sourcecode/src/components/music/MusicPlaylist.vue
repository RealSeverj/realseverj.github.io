<template>
  <div class="playlist">
    <div class="playlist-header" @click="toggleOpen">
      <span>播放列表 ({{ playlist.length }})</span>
      <div class="header-arrow" :class="{ 'is-rotated': isOpen }">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
    </div>
    
    <!-- 丝滑折叠外层（CSS Grid 0fr <-> 1fr） -->
    <div class="playlist-collapse" :class="{ 'is-open': isOpen }">
      <div class="playlist-collapse-inner">
        <div class="playlist-items">
          <div 
            v-for="(track, index) in playlist" 
            :key="index"
            :class="['playlist-item', { active: currentIndex === index }]"
            @click="$emit('select-track', index)"
          >
            <div class="item-index">{{ index + 1 }}</div>
            <div class="item-info">
              <div class="item-title">{{ track.title }}</div>
              <div class="item-artist">{{ track.artist }}</div>
            </div>
            <div class="item-duration" aria-hidden="true" title="播放">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M9 6l6 6-6 6z"/>
              </svg>
            </div>
            <svg v-if="currentIndex === index && isPlaying" class="item-playing" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M4 10h2v4H4v-4zm4-3h2v10H8V7zm4 5h2v4h-2v-4zm4-8h2v18h-2V4z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  playlist: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false }
})

defineEmits(['select-track'])

const isOpen = ref(false)
function toggleOpen() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.playlist { 
  border-top: 1px solid rgba(255, 255, 255, 0.08); 
  padding-top: 10px; 
}

.playlist-header {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 8px 12px; 
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-sm); 
  cursor: pointer; 
  color: var(--fg);
  font-size: 0.9rem; 
  font-weight: 500; 
  user-select: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.playlist-header:hover { 
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.header-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-muted);
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
}

.header-arrow.is-rotated {
  transform: rotate(180deg);
  color: #ffffff;
}

/* 播放列表抽屉 0fr <-> 1fr 丝滑折叠动画 */
.playlist-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease;
  opacity: 0;
  pointer-events: none;
}

.playlist-collapse.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
  pointer-events: auto;
}

.playlist-collapse-inner {
  min-height: 0;
  overflow: hidden;
}

.playlist-items { 
  margin-top: 8px; 
  max-height: 220px; 
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playlist-items::-webkit-scrollbar {
  display: none;
}

.playlist-item {
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 8px 10px;
  border-radius: var(--radius-sm); 
  cursor: pointer; 
  border: 1px solid transparent;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.playlist-item:hover { 
  background: rgba(255, 255, 255, 0.07); 
  border-color: rgba(255, 255, 255, 0.1);
}

.playlist-item.active { 
  background: rgba(255, 255, 255, 0.12); 
  border-color: rgba(255, 255, 255, 0.2);
}

.item-index { 
  width: 22px; 
  text-align: center; 
  font-size: 0.8rem; 
  color: var(--fg-subtle); 
}

.item-info { 
  flex: 1; 
  min-width: 0; 
}

.item-title { 
  font-size: 0.88rem; 
  color: var(--fg); 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

.item-artist { 
  font-size: 0.78rem; 
  color: var(--fg-subtle); 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  margin-top: 2px; 
}

.item-duration { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  width: 18px; 
  color: var(--fg-subtle); 
}

.item-playing { 
  color: #ffffff; 
  animation: pulse 1.5s ease-in-out infinite; 
}

@keyframes pulse { 
  0%, 100% { opacity: 0.5; } 
  50% { opacity: 1; } 
}
</style>
