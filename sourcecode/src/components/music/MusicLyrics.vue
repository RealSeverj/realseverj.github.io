<template>
  <div v-if="lyrics.length > 0" class="lyrics-display">
    <div class="lyrics-scroll" ref="scrollContainerRef">
      <div 
        v-for="(line, index) in lyrics" 
        :key="index"
        :class="['lyric-line', { active: activeIndex === index }]"
        :data-index="index"
      >
        {{ line.text }}
      </div>
    </div>
  </div>
  
  <div v-else-if="hasTrack" class="no-lyrics">
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
    </svg>
    <p>纯音乐，请欣赏</p>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  lyrics: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: -1 },
  hasTrack: { type: Boolean, default: false }
})

const scrollContainerRef = ref(null)

function scrollToActiveLine(newIndex) {
  if (newIndex < 0 || !scrollContainerRef.value) return
  const container = scrollContainerRef.value
  const activeEl = container.querySelector(`[data-index="${newIndex}"]`)
  if (!activeEl) return

  // 计算行元素相对于歌词容器顶部的偏移，避免使用原生 scrollIntoView 导致外层侧边栏联动滚动
  const containerRect = container.getBoundingClientRect()
  const activeRect = activeEl.getBoundingClientRect()
  const relativeTop = activeRect.top - containerRect.top + container.scrollTop
  const targetScrollTop = relativeTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2)

  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  })
}

watch(() => props.activeIndex, (newIndex) => {
  nextTick(() => {
    scrollToActiveLine(newIndex)
  })
})
</script>

<style scoped>
.lyrics-display {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-md); 
  padding: 8px 12px; 
  max-height: 190px; 
  overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
}

.lyrics-scroll {
  max-height: 160px; 
  overflow-y: auto; 
  /* 增加上下留白，确保首行与末行歌词均可在正中间高亮居中 */
  padding: 60px 8px;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.lyrics-scroll::-webkit-scrollbar {
  display: none;
}

.lyric-line {
  text-align: center; 
  padding: 6px 0; 
  color: var(--fg-subtle);
  font-size: 0.88rem; 
  line-height: 1.5; 
  transition: color 0.25s ease, transform 0.25s ease, font-weight 0.25s ease;
}

.lyric-line.active { 
  color: #ffffff; 
  font-size: 0.98rem; 
  font-weight: 600; 
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
  transform: scale(1.05); 
}

.no-lyrics {
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  padding: 26px 16px; 
  color: var(--fg-subtle); 
  gap: 8px;
}

.no-lyrics svg { 
  opacity: 0.5; 
}

@media (max-width: 768px) {
  .lyrics-display { max-height: 160px; }
  .lyrics-scroll { max-height: 130px; padding: 48px 6px; }
}
</style>
