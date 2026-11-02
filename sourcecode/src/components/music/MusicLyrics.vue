<template>
  <div v-if="ambient && hasTrack" class="ambient-lyrics">
    <Transition name="ambient-line" mode="out-in">
      <div v-if="ambientLines.length" :key="ambientKey" class="ambient-lyrics__verse">
        <p v-for="(text, index) in ambientLines" :key="index" :class="index ? 'ambient-lyrics__translation' : 'ambient-lyrics__current'">{{ text }}</p>
        <p v-if="nextLine" class="ambient-lyrics__next">{{ nextLine }}</p>
      </div>
      <p v-else :key="lyrics.length ? 'intro' : 'instrumental'" class="ambient-lyrics__status">{{ lyrics.length ? '前奏 · 静静聆听' : '纯音乐 · 静静聆听' }}</p>
    </Transition>
  </div>

  <div v-else-if="!ambient && lyrics.length > 0" class="lyrics-display">
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
  
  <div v-else-if="!ambient && hasTrack" class="no-lyrics">
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
    </svg>
    <p>纯音乐，请欣赏</p>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps({
  lyrics: { type: Array, default: () => [] },
  activeIndex: { type: Number, default: -1 },
  hasTrack: { type: Boolean, default: false },
  ambient: { type: Boolean, default: false }
})

function splitTranslation(text) {
  const bilingual = text.match(/^(.+?)\s{2,}([\u3400-\u9fff].*)$/)
  return bilingual ? [bilingual[1], bilingual[2]] : [text]
}

const activeLine = computed(() => props.lyrics[props.activeIndex])
const ambientLines = computed(() => {
  if (!activeLine.value) return []
  return props.lyrics
    .filter((line) => line.time === activeLine.value.time)
    .flatMap((line) => splitTranslation(line.text))
    .slice(0, 2)
})
const ambientKey = computed(() => `${activeLine.value?.time}:${ambientLines.value.join('|')}`)
const nextLine = computed(() => {
  if (!activeLine.value) return ''
  const line = props.lyrics.find((line) => line.time > activeLine.value.time)
  return line ? splitTranslation(line.text)[0] : ''
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
  if (props.ambient) return
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
.ambient-lyrics { display: flex; align-items: flex-end; min-height: 88px; color: #f5fcff; text-shadow: 0 1px 4px rgba(5, 25, 36, 0.85), 0 3px 18px rgba(5, 25, 36, 0.35); }
.ambient-lyrics p { margin: 0; }
.ambient-lyrics__verse { width: 100%; }
.ambient-lyrics__current { font-size: clamp(1rem, 1.3vw, 1.25rem); font-weight: 500; line-height: 1.6; letter-spacing: 0.015em; }
.ambient-lyrics__translation { margin-top: 3px !important; font-size: 0.85rem; line-height: 1.6; color: #e4f0f6; }
.ambient-lyrics__next { margin-top: 12px !important; font-size: 0.78rem; line-height: 1.5; color: rgba(239, 249, 255, 0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ambient-lyrics__status { font-size: 0.78rem; letter-spacing: 0.16em; color: #e5f2f8; }
.ambient-line-enter-active, .ambient-line-leave-active { transition: opacity 200ms ease, transform 260ms ease; }
.ambient-line-enter-from { opacity: 0; transform: translateY(6px); }
.ambient-line-leave-to { opacity: 0; transform: translateY(-4px); }
@media (prefers-reduced-motion: reduce) {
  .ambient-line-enter-active, .ambient-line-leave-active { transition: none; }
}
</style>
