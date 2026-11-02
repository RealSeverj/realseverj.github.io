<script setup>
import { ref } from 'vue'
import { nearParticles, deepParticles } from '../data/petals.js'
import { usePetalWind } from '../composables/usePetalWind.js'

const containerRef = ref(null)
usePetalWind(containerRef)
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

