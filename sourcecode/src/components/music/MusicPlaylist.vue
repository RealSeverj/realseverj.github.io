<template>
  <div class="playlist" :class="{ 'playlist--inline': !collapsible }">
    <button v-if="collapsible" class="playlist-header" type="button" :aria-expanded="isOpen" :aria-controls="listId" @click="toggleOpen">
      <span>播放列表 ({{ playlist.length }})</span>
      <div class="header-arrow" :class="{ 'is-rotated': isOpen }">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </div>
    </button>
    
    <!-- 丝滑折叠外层（CSS Grid 0fr <-> 1fr） -->
    <div :id="listId" class="playlist-collapse" :class="{ 'is-open': !collapsible || isOpen }" :inert="collapsible && !isOpen ? '' : undefined">
      <div class="playlist-collapse-inner">
        <div ref="items" class="playlist-items">
          <button
            type="button"
            v-for="(track, index) in playlist" 
            :key="index"
            :class="['playlist-item', { active: currentIndex === index }]"
            :aria-current="currentIndex === index ? 'true' : undefined"
            @click="$emit('select-track', index)"
          >
            <span class="item-index">{{ index + 1 }}</span>
            <span class="item-info">
              <span class="item-title">{{ track.title }}</span>
              <span class="item-artist">{{ track.artist }}</span>
            </span>
            <span class="item-duration" aria-hidden="true" title="播放">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M9 6l6 6-6 6z"/>
              </svg>
            </span>
            <svg v-if="currentIndex === index && isPlaying" class="item-playing" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M4 10h2v4H4v-4zm4-3h2v10H8V7zm4 5h2v4h-2v-4zm4-8h2v18h-2V4z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, useId, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  playlist: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false },
  collapsible: { type: Boolean, default: true }
})

defineEmits(['select-track'])

const isOpen = ref(false)
const items = ref(null)
const listId = useId()

function revealCurrentTrack() {
  const list = items.value
  const active = list?.querySelector('.active')
  if (!list || !active) return
  const listRect = list.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  if (activeRect.top < listRect.top || activeRect.bottom > listRect.bottom) {
    list.scrollTop += activeRect.top - listRect.top - (list.clientHeight - activeRect.height) / 2
  }
}

onMounted(() => nextTick(revealCurrentTrack))
watch(() => props.currentIndex, () => nextTick(revealCurrentTrack))
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
  width: 100%;
  text-align: left;
  font-family: inherit;
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
  width: 100%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.02);
  text-align: left;
  font: inherit;
  display: flex; 
  align-items: center; 
  gap: 10px; 
  padding: 9px 12px;
  border-radius: var(--radius-md); 
  cursor: pointer; 
  border: 1px solid transparent;
  transition: background var(--dur-fast) ease, border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease;
}

.playlist-item:hover { 
  background: rgba(255, 255, 255, 0.08); 
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transform: translateX(2px);
}

.playlist-item.active { 
  background: linear-gradient(135deg, rgba(185, 225, 245, 0.2) 0%, rgba(130, 190, 230, 0.08) 100%); 
  border-color: rgba(185, 225, 245, 0.35);
  box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.28);
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
  display: block;
  font-size: 0.88rem; 
  color: var(--fg); 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

.item-artist { 
  display: block;
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
.playlist--inline { flex: 1; min-height: 0; display: flex; flex-direction: column; border: 0; padding: 0; }
.playlist--inline .playlist-collapse { flex: 1; min-height: 0; transition: none; }
.playlist--inline .playlist-items { height: 100%; max-height: none; margin-top: 0; padding-right: 4px; overscroll-behavior: contain; gap: 5px; }
.playlist--inline .playlist-items::-webkit-scrollbar { display: block; width: 4px; }
.playlist--inline .playlist-items::-webkit-scrollbar-track { background: transparent; }
.playlist--inline .playlist-items::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.16); border-radius: 999px; }
.playlist--inline .playlist-items::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
.playlist--inline .playlist-items::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
.playlist--inline .playlist-item { padding: 8px 10px; }
.playlist--inline .item-artist { color: var(--fg-muted); }
@media (prefers-reduced-motion: reduce) {
  .item-playing { animation: none; }
  .playlist-collapse { transition: none; }
}
</style>
