<script setup>
import { useCustomCursor } from '../composables/useCustomCursor.js'

const { ringRef, isVisible, isHovering, isPressed, bursts } = useCustomCursor()
</script>

<template>
  <div class="cursor-stage" aria-hidden="true">
    <!-- 阻尼随动冰蓝光环（仅精细指针设备显示） -->
    <div
      ref="ringRef"
      class="cursor-ring"
      :class="{
        'is-visible': isVisible,
        'is-hover': isHovering,
        'is-pressed': isPressed
      }"
    >
      <span class="cursor-ring__loop"></span>
    </div>

    <!-- 点击晨露水波与四角星芒微粒 -->
    <div
      v-for="burst in bursts"
      :key="burst.id"
      class="cursor-burst"
      :style="{ left: `${burst.x}px`, top: `${burst.y}px` }"
    >
      <span class="cursor-burst__Flash"></span>
      <span class="cursor-burst__wave cursor-burst__wave--outer"></span>
      <span class="cursor-burst__wave cursor-burst__wave--inner"></span>
      <svg
        v-for="spark in burst.sparks"
        :key="spark.id"
        class="cursor-burst__spark"
        :class="`cursor-burst__spark--${spark.variant}`"
        viewBox="0 0 16 16"
        :style="{
          '--dx': spark.dx,
          '--dy': spark.dy,
          '--rot': spark.rot,
          '--sc': spark.scale
        }"
      >
        <path
          d="M8 1.5 C8.6 1.5 9 2 9.3 3.2 L10 5.6 C10.2 6.2 10.6 6.6 11.2 6.8 L13.6 7.5 C14.5 7.8 14.5 8.2 13.6 8.5 L11.2 9.2 C10.6 9.4 10.2 9.8 10 10.4 L9.3 12.8 C9 14 8.6 14.5 8 14.5 C7.4 14.5 7 14 6.7 12.8 L6 10.4 C5.8 9.8 5.4 9.4 4.8 9.2 L2.4 8.5 C1.5 8.2 1.5 7.8 2.4 7.5 L4.8 6.8 C5.4 6.6 5.8 6.2 6 5.6 L6.7 3.2 C7 2 7.4 1.5 8 1.5 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.cursor-stage {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}

/* 随动微光环 */
.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  width: 26px;
  height: 26px;
  margin-left: -13px;
  margin-top: -13px;
  transform: translate3d(var(--ring-x, -100px), var(--ring-y, -100px), 0);
  opacity: 0;
  transition: opacity 220ms ease;
  will-change: transform, opacity;
}

.cursor-ring.is-visible {
  opacity: 1;
}

.cursor-ring__loop {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(240, 250, 255, 0.04);
  transition:
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 220ms ease,
    background-color 220ms ease;
}

.cursor-ring.is-hover .cursor-ring__loop {
  transform: scale(1.42);
  border-color: rgba(255, 255, 255, 0.56);
  background: rgba(224, 245, 255, 0.08);
}

.cursor-ring.is-pressed .cursor-ring__loop {
  transform: scale(0.8);
  border-color: rgba(255, 255, 255, 0.72);
  background: rgba(224, 245, 255, 0.14);
}

/* 点击涟漪容器 */
.cursor-burst {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* 中心瞬时微光点 */
.cursor-burst__Flash {
  position: absolute;
  left: -4px;
  top: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  animation: burst-flash 360ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 双层花露水波 */
.cursor-burst__wave {
  position: absolute;
  left: -24px;
  top: -24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.cursor-burst__wave--outer {
  border: 1px solid rgba(200, 236, 255, 0.58);
  animation: burst-wave 580ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.cursor-burst__wave--inner {
  border: 1px solid rgba(255, 255, 255, 0.45);
  animation: burst-wave-inner 640ms cubic-bezier(0.16, 1, 0.3, 1) 50ms forwards;
  opacity: 0;
}

/* 四角星芒微粒 */
.cursor-burst__spark {
  position: absolute;
  left: -5px;
  top: -5px;
  width: 10px;
  height: 10px;
  animation: burst-spark 620ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.cursor-burst__spark--ice {
  color: rgba(186, 230, 253, 0.82);
}

.cursor-burst__spark--moon {
  color: rgba(248, 253, 255, 0.85);
}

@keyframes burst-flash {
  0% {
    transform: scale(0.5);
    opacity: 0.95;
  }
  100% {
    transform: scale(2.1);
    opacity: 0;
  }
}

@keyframes burst-wave {
  0% {
    transform: scale(0.18);
    opacity: 0.92;
  }
  100% {
    transform: scale(1.22);
    opacity: 0;
  }
}

@keyframes burst-wave-inner {
  0% {
    transform: scale(0.12);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.86);
    opacity: 0;
  }
}

@keyframes burst-spark {
  0% {
    transform: translate3d(0, 0, 0) scale(0.35) rotate(0deg);
    opacity: 0.98;
  }
  35% {
    opacity: 0.92;
  }
  100% {
    transform: translate3d(var(--dx), var(--dy), 0) scale(var(--sc, 0.85)) rotate(var(--rot, 45deg));
    opacity: 0;
  }
}

@media (hover: none), (pointer: coarse) {
  .cursor-ring {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cursor-ring__loop {
    transition: none;
  }
  .cursor-burst__spark,
  .cursor-burst__wave--inner {
    display: none;
  }
}
</style>

