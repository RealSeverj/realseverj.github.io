<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref(null)

// 粒子类型与景深分层定义
// 严格控制总数在 16 个以内，追求极度宁静、空气感与景深错落
const particles = [
  // 近景虚焦大花瓣（Foreground Bokeh，仅 2 片，产生摄影机在花草丛边的纵深）
  {
    id: 'near-1',
    tier: 'near',
    type: 'petal',
    variant: 'blue',
    size: 32,
    blur: 3.5,
    opacity: 0.32,
    startX: 12,
    startY: 90,
    endX: 88,
    endY: -15,
    duration: 13,
    delay: -4.5,
    swayDuration: 4.8,
    swayAmount: 26,
    spinDuration: 6.2
  },
  {
    id: 'near-2',
    tier: 'near',
    type: 'petal',
    variant: 'white',
    size: 26,
    blur: 2.8,
    opacity: 0.28,
    startX: 35,
    startY: 96,
    endX: 105,
    endY: 5,
    duration: 15,
    delay: -11.2,
    swayDuration: 5.4,
    swayAmount: 22,
    spinDuration: 7.1
  },

  // 中景清晰自然花瓣（Midground Crisp，6 片，与草地和少女产生空间呼应）
  {
    id: 'mid-1',
    tier: 'mid',
    type: 'petal',
    variant: 'blue',
    size: 14,
    blur: 0,
    opacity: 0.78,
    startX: 4,
    startY: 85,
    endX: 78,
    endY: -10,
    duration: 18,
    delay: -2.3,
    swayDuration: 4.2,
    swayAmount: 18,
    spinDuration: 5.6
  },
  {
    id: 'mid-2',
    tier: 'mid',
    type: 'petal',
    variant: 'white',
    size: 12,
    blur: 0,
    opacity: 0.85,
    startX: 22,
    startY: 92,
    endX: 92,
    endY: -8,
    duration: 21,
    delay: -8.8,
    swayDuration: 4.6,
    swayAmount: 16,
    spinDuration: 6.8
  },
  {
    id: 'mid-3',
    tier: 'mid',
    type: 'petal',
    variant: 'blue',
    size: 15,
    blur: 0,
    opacity: 0.72,
    startX: -5,
    startY: 70,
    endX: 68,
    endY: -12,
    duration: 23,
    delay: -14.1,
    swayDuration: 5.1,
    swayAmount: 20,
    spinDuration: 7.4
  },
  {
    id: 'mid-4',
    tier: 'mid',
    type: 'petal',
    variant: 'white',
    size: 11,
    blur: 0,
    opacity: 0.8,
    startX: 48,
    startY: 98,
    endX: 112,
    endY: 15,
    duration: 20,
    delay: -5.7,
    swayDuration: 4.5,
    swayAmount: 15,
    spinDuration: 5.9
  },
  {
    id: 'mid-5',
    tier: 'mid',
    type: 'petal',
    variant: 'blue',
    size: 13,
    blur: 0,
    opacity: 0.75,
    startX: 15,
    startY: 95,
    endX: 82,
    endY: -5,
    duration: 24,
    delay: -17.5,
    swayDuration: 5.3,
    swayAmount: 19,
    spinDuration: 6.4
  },
  {
    id: 'mid-6',
    tier: 'mid',
    type: 'petal',
    variant: 'white',
    size: 10,
    blur: 0,
    opacity: 0.7,
    startX: 30,
    startY: 88,
    endX: 98,
    endY: -10,
    duration: 26,
    delay: -10.9,
    swayDuration: 4.9,
    swayAmount: 14,
    spinDuration: 6.1
  },

  // 远景微光尘埃（Background Luminous Dust，8 个，模拟日光微尘漫反射）
  {
    id: 'far-1',
    tier: 'far',
    type: 'dust',
    size: 3.5,
    blur: 0.4,
    opacity: 0.55,
    startX: 8,
    startY: 78,
    endX: 65,
    endY: -5,
    duration: 27,
    delay: -3.1,
    swayDuration: 6.2,
    swayAmount: 12
  },
  {
    id: 'far-2',
    tier: 'far',
    type: 'dust',
    size: 2.5,
    blur: 0.2,
    opacity: 0.45,
    startX: 28,
    startY: 85,
    endX: 84,
    endY: -8,
    duration: 32,
    delay: -12.4,
    swayDuration: 7.1,
    swayAmount: 10
  },
  {
    id: 'far-3',
    tier: 'far',
    type: 'dust',
    size: 4.0,
    blur: 0.6,
    opacity: 0.6,
    startX: 45,
    startY: 92,
    endX: 96,
    endY: 5,
    duration: 29,
    delay: -7.6,
    swayDuration: 6.5,
    swayAmount: 14
  },
  {
    id: 'far-4',
    tier: 'far',
    type: 'dust',
    size: 2.8,
    blur: 0.3,
    opacity: 0.5,
    startX: -2,
    startY: 65,
    endX: 52,
    endY: -10,
    duration: 34,
    delay: -19.2,
    swayDuration: 7.5,
    swayAmount: 11
  },
  {
    id: 'far-5',
    tier: 'far',
    type: 'dust',
    size: 3.2,
    blur: 0.4,
    opacity: 0.52,
    startX: 60,
    startY: 95,
    endX: 115,
    endY: 20,
    duration: 30,
    delay: -15.8,
    swayDuration: 6.8,
    swayAmount: 13
  },
  {
    id: 'far-6',
    tier: 'far',
    type: 'dust',
    size: 2.2,
    blur: 0.2,
    opacity: 0.4,
    startX: 18,
    startY: 90,
    endX: 72,
    endY: -6,
    duration: 36,
    delay: -24.0,
    swayDuration: 8.0,
    swayAmount: 9
  },
  {
    id: 'far-7',
    tier: 'far',
    type: 'dust',
    size: 3.6,
    blur: 0.5,
    opacity: 0.58,
    startX: 38,
    startY: 82,
    endX: 90,
    endY: -2,
    duration: 28,
    delay: -9.5,
    swayDuration: 6.4,
    swayAmount: 12
  },
  {
    id: 'far-8',
    tier: 'far',
    type: 'dust',
    size: 2.6,
    blur: 0.3,
    opacity: 0.48,
    startX: 52,
    startY: 75,
    endX: 102,
    endY: 10,
    duration: 33,
    delay: -21.3,
    swayDuration: 7.2,
    swayAmount: 11
  }
]

const nearParticles = particles.filter((p) => p.tier === 'near')
const deepParticles = particles.filter((p) => p.tier !== 'near')

// 交互微风动力学：鼠标滑动时产生微小、平滑的阻尼风偏
let windX = 0
let windY = 0
let targetWindX = 0
let targetWindY = 0
let lastX = 0
let lastY = 0
let lastTime = 0
let rafId = 0
let isReduced = false

function onPointerMove(e) {
  if (isReduced) return
  const now = performance.now()
  if (lastTime > 0) {
    const dt = Math.max(16, now - lastTime)
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    // 限制微风最大偏转在 ±16px，保持绝对克制优雅
    targetWindX = Math.max(-16, Math.min(16, (dx / dt) * 10))
    targetWindY = Math.max(-12, Math.min(12, (dy / dt) * 8))
  }
  lastX = e.clientX
  lastY = e.clientY
  lastTime = now
}

function updateWind() {
  windX += (targetWindX - windX) * 0.06
  windY += (targetWindY - windY) * 0.06
  targetWindX *= 0.94
  targetWindY *= 0.94

  if (containerRef.value) {
    containerRef.value.style.setProperty('--breeze-wind-x', `${windX.toFixed(2)}px`)
    containerRef.value.style.setProperty('--breeze-wind-y', `${windY.toFixed(2)}px`)
  }
  rafId = requestAnimationFrame(updateWind)
}

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  isReduced = mediaQuery.matches
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  if (!isReduced) {
    rafId = requestAnimationFrame(updateWind)
  }
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="containerRef" class="petal-breeze-root" aria-hidden="true">
    <!-- SVG 颜色渐变定义 -->
    <svg class="breeze-defs" width="0" height="0">
      <defs>
        <!-- 喜林草浅蓝花瓣渐变 -->
        <linearGradient id="petal-grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0f8ff" stop-opacity="0.95" />
          <stop offset="55%" stop-color="#b8ddf5" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#7eb7de" stop-opacity="0.65" />
        </linearGradient>
        <!-- 月白雏菊花瓣渐变 -->
        <linearGradient id="petal-grad-white" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96" />
          <stop offset="60%" stop-color="#eaf4fa" stop-opacity="0.82" />
          <stop offset="100%" stop-color="#c8e2f2" stop-opacity="0.65" />
        </linearGradient>
      </defs>
    </svg>

    <!-- 中远景层（位于 UI 之下、壁纸之上，穿透半透明磨砂卡片折射） -->
    <div class="breeze-layer breeze-layer--deep">
      <div
        v-for="p in deepParticles"
        :key="p.id"
        class="breeze-flight"
        :style="{
          '--start-x': `${p.startX}vw`,
          '--start-y': `${p.startY}vh`,
          '--end-x': `${p.endX}vw`,
          '--end-y': `${p.endY}vh`,
          '--flight-duration': `${p.duration}s`,
          '--flight-delay': `${p.delay}s`,
          '--sway-duration': `${p.swayDuration}s`,
          '--sway-amount': `${p.swayAmount}px`
        }"
      >
        <div class="breeze-sway">
          <!-- 花瓣 -->
          <div
            v-if="p.type === 'petal'"
            class="breeze-spin"
            :style="{
              '--spin-duration': `${p.spinDuration}s`,
              width: `${p.size}px`,
              height: `${p.size * 1.25}px`,
              opacity: p.opacity
            }"
          >
            <svg viewBox="0 0 32 40" class="petal-svg">
              <path
                d="M16 2 C24 7, 30 18, 22 36 C14 39, 8 30, 5 18 C3 8, 8 2, 16 2 Z"
                :fill="p.variant === 'blue' ? 'url(#petal-grad-blue)' : 'url(#petal-grad-white)'"
              />
            </svg>
          </div>

          <!-- 远景微光尘埃 -->
          <div
            v-else
            class="dust-speck"
            :style="{
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`
            }"
          />
        </div>
      </div>
    </div>

    <!-- 近景虚焦层（位于前景，仅 2 片大花瓣掠过，产生强烈摄影机镜头景深） -->
    <div class="breeze-layer breeze-layer--near">
      <div
        v-for="p in nearParticles"
        :key="p.id"
        class="breeze-flight"
        :style="{
          '--start-x': `${p.startX}vw`,
          '--start-y': `${p.startY}vh`,
          '--end-x': `${p.endX}vw`,
          '--end-y': `${p.endY}vh`,
          '--flight-duration': `${p.duration}s`,
          '--flight-delay': `${p.delay}s`,
          '--sway-duration': `${p.swayDuration}s`,
          '--sway-amount': `${p.swayAmount}px`
        }"
      >
        <div class="breeze-sway">
          <div
            class="breeze-spin"
            :style="{
              '--spin-duration': `${p.spinDuration}s`,
              width: `${p.size}px`,
              height: `${p.size * 1.25}px`,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`
            }"
          >
            <svg viewBox="0 0 32 40" class="petal-svg">
              <path
                d="M16 2 C24 7, 30 18, 22 36 C14 39, 8 30, 5 18 C3 8, 8 2, 16 2 Z"
                :fill="p.variant === 'blue' ? 'url(#petal-grad-blue)' : 'url(#petal-grad-white)'"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.petal-breeze-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  /* 随着进入正文阅读区域，自然平滑减淡，不打扰阅读 */
  opacity: calc(1 - var(--scene-progress, 0) * 0.75);
  transition: opacity 300ms ease-out;
}

.breeze-defs {
  position: absolute;
  width: 0;
  height: 0;
}

.breeze-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.breeze-layer--deep {
  z-index: 0;
}

.breeze-layer--near {
  z-index: 8;
}

/* 第一重动画：主风向大位移 + 鼠标微风交互偏转 */
.breeze-flight {
  position: absolute;
  top: 0;
  left: 0;
  animation: flight var(--flight-duration, 20s) linear infinite;
  animation-delay: var(--flight-delay, 0s);
  will-change: transform;
}

@keyframes flight {
  0% {
    transform: translate3d(
      calc(var(--start-x) + var(--breeze-wind-x, 0px)),
      calc(var(--start-y) + var(--breeze-wind-y, 0px)),
      0
    );
  }
  100% {
    transform: translate3d(
      calc(var(--end-x) + var(--breeze-wind-x, 0px)),
      calc(var(--end-y) + var(--breeze-wind-y, 0px)),
      0
    );
  }
}

/* 第二重动画：正弦横向微幅摇曳（Sway） */
.breeze-sway {
  animation: sway var(--sway-duration, 5s) ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes sway {
  0% {
    transform: translateX(calc(-1 * var(--sway-amount, 16px))) rotate(-8deg);
  }
  100% {
    transform: translateX(var(--sway-amount, 16px)) rotate(10deg);
  }
}

/* 第三重动画：花瓣在空间中的 3D 俯仰与翻转（Tumble & Spin） */
.breeze-spin {
  transform-origin: center center;
  animation: spin var(--spin-duration, 6s) ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes spin {
  0% {
    transform: rotate3d(1, 0.4, 0.2, 0deg) scale(0.92);
  }
  50% {
    transform: rotate3d(0.8, 1, 0.3, 110deg) scale(1.04);
  }
  100% {
    transform: rotate3d(0.5, 0.8, 1, 220deg) scale(0.95);
  }
}

.petal-svg {
  width: 100%;
  height: 100%;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(20, 45, 65, 0.15));
}

/* 远景光尘微粒 */
.dust-speck {
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(175, 215, 240, 0.5) 60%, transparent 100%);
  box-shadow: 0 0 6px rgba(220, 242, 255, 0.7);
}

@media (max-width: 768px) {
  /* 移动端减半粒子，确保极端省电与纯净 */
  .breeze-layer--near {
    display: none;
  }
  .breeze-flight:nth-child(even) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .breeze-flight,
  .breeze-sway,
  .breeze-spin {
    animation: none !important;
  }
  .petal-breeze-root {
    opacity: 0.25;
  }
}
</style>

