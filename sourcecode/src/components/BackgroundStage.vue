<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  image: { type: String, default: '' },
  blur: { type: Number, default: 0 },
  overlay: { type: String, default: 'transparent' }
})

const stageRef = ref(null)
const displayedImage = ref('')
const hasOverlay = computed(() => Boolean(props.overlay) && props.overlay !== 'transparent')
let loadToken = 0

watch(() => props.image, (newSrc) => {
  const token = ++loadToken
  if (!newSrc) {
    displayedImage.value = ''
    return
  }
  const img = new Image()
  img.onload = () => {
    if (token === loadToken) displayedImage.value = newSrc
  }
  img.src = newSrc
}, { immediate: true })

// 鼠标微视差逻辑：平滑阻尼微幅位移，带来空气景深
let currentX = 0
let currentY = 0
let targetX = 0
let targetY = 0
let rafId = 0
let isReduced = false

function onPointerMove(e) {
  if (isReduced) return
  if (e.pointerType === 'touch') return
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const nx = (e.clientX - cx) / cx
  const ny = (e.clientY - cy) / cy
  // 最大位移仅 ±10px 反向微视差，克制且平稳
  targetX = -nx * 10
  targetY = -ny * 8
}

function updateParallax() {
  currentX += (targetX - currentX) * 0.05
  currentY += (targetY - currentY) * 0.05

  if (stageRef.value) {
    stageRef.value.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`)
    stageRef.value.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`)
  }
  rafId = requestAnimationFrame(updateParallax)
}

onMounted(() => {
  isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!isReduced) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    rafId = requestAnimationFrame(updateParallax)
  }
})

onUnmounted(() => {
  loadToken++
  window.removeEventListener('pointermove', onPointerMove)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="stageRef" class="background-stage" aria-hidden="true" :style="{ '--wallpaper-blur': `${blur}px` }">
    <div class="background-gradient"></div>
    <Transition name="bgfade">
      <div v-if="displayedImage" :key="displayedImage" class="background-image" :style="{ backgroundImage: `url(${displayedImage})` }"></div>
    </Transition>
    <div class="background-daylight"></div>
    <div v-if="hasOverlay" class="background-tint" :style="{ background: overlay }"></div>
    <div class="background-reading"></div>
  </div>
</template>

<style scoped>
.background-stage {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.background-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(130deg, #b0dce2, #557f8d 70%, #254855);
}

.background-image {
  position: absolute;
  /* 留出 18px 溢出安全区，防止视差偏移时露白边 */
  inset: -18px;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: blur(var(--wallpaper-blur, 0px));
  transform: translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0);
  will-change: transform;
}

.background-daylight {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(223, 245, 247, 0.12), transparent 55%);
}

.background-tint {
  position: absolute;
  inset: 0;
}

.background-reading {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 20, 29, 0.64), rgba(5, 17, 26, 0.82));
  opacity: var(--scene-progress, 0);
}

.bgfade-enter-active,
.bgfade-leave-active {
  transition: opacity 650ms ease;
}

.bgfade-enter-from,
.bgfade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .background-image {
    inset: 0;
    transform: none !important;
    background-position: 65% center;
  }
  .background-daylight {
    background: linear-gradient(90deg, rgba(213, 238, 242, 0.48), rgba(213, 238, 242, 0.06) 80%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .background-image {
    transform: none !important;
  }
  .bgfade-enter-active,
  .bgfade-leave-active {
    transition: none;
  }
}
</style>
