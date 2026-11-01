<template>
  <div class="background-stage" role="presentation" :style="{ '--wallpaper-blur': `${blur}px` }">
    <div class="background-gradient"></div>
    <transition name="bgfade" mode="in-out">
      <div :key="displayedImage || 'noimg'" class="background-image" :class="{ 'background-image--hidden': !displayedImage, 'background-image--loaded': imageLoaded, 'background-image--animate': imageLoaded }" :style="imageStyle"></div>
    </transition>
    <div class="background-overlay"></div>
    <div v-if="hasOverlay" class="background-tint" :style="{ background: overlay }"></div>
    <div class="background-glow">
      <span v-for="dot in dots" :key="dot" class="glow-dot"></span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  image: {
    type: String,
    default: ''
  },
  blur: {
    type: Number,
    default: 6
  },
  overlay: {
    type: String,
    default: 'rgba(var(--scrim-rgb), 0.62)'
  }
})

const dots = Array.from({ length: 12 }, (_, index) => index)

// overlay 为 'transparent' 时视为不额外压暗，允许只靠 .background-overlay 的渐变
const hasOverlay = computed(() => Boolean(props.overlay) && props.overlay !== 'transparent')

// 当前正在显示的图片 URL（只有预加载成功后才会切换到这里）
const displayedImage = ref('')
const imageLoaded = ref(false)

// 预加载并切换：避免在新图未就绪时把旧图隐藏
let loadToken = 0
watch(
  () => props.image,
  (newSrc) => {
    const token = ++loadToken
    if (!newSrc) {
      // 无图片时回到纯背景
      displayedImage.value = ''
      imageLoaded.value = false
      return
    }
    // 预加载新图片
    imageLoaded.value = false // 不影响旧图显示，旧图仍在 DOM，透明度由过渡控制
    const img = new Image()
    img.onload = () => {
      // 只应用最后一次请求的结果，防止竞态
      if (token === loadToken) {
        displayedImage.value = newSrc
        imageLoaded.value = true
      }
    }
    img.onerror = () => {
      if (token === loadToken) {
        // 加载失败则不切换，保持旧图
        imageLoaded.value = true
      }
    }
    img.src = newSrc
  },
  { immediate: true }
)

const imageStyle = computed(() => {
  const style = {}
  if (displayedImage.value) {
    style.backgroundImage = `url(${displayedImage.value})`
  }
  return style
})
</script>

<style scoped>
.background-stage {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -2;
}

.background-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(100% 100% at 50% 20%, rgba(26, 36, 62, 0.45) 0%, rgba(8, 12, 22, 0.85) 100%), #0a0d18;
  transform: scale(1.05);
}

.background-image {
  position: absolute;
  inset: -4%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 700ms ease;
  will-change: transform, opacity;
  contain: paint;
  transform: translateZ(0);
  filter: blur(var(--wallpaper-blur, 0px));
}

.background-image--loaded {
  opacity: 0.72;
}

.background-image--hidden {
  opacity: 0;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 30%, rgba(10, 14, 26, 0.25) 0%, rgba(6, 9, 18, 0.55) 100%);
}

.background-tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.background-glow {
  position: absolute;
  inset: -10%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16vh;
  transform: rotate(-6deg);
  pointer-events: none;
}

.glow-dot {
  width: 22vh;
  height: 22vh;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
  animation: pulse 9s ease-in-out infinite;
  opacity: 0.35;
}

.glow-dot:nth-child(odd) {
  animation-delay: 2.4s;
  opacity: 0.22;
}

.glow-dot:nth-child(even) {
  animation-delay: 5.1s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.9) translate3d(0, 0, 0);
    opacity: 0.18;
  }
  40% {
    transform: scale(1.15) translate3d(0, -10%, 0);
    opacity: 0.4;
  }
  70% {
    transform: scale(1) translate3d(0, 6%, 0);
    opacity: 0.3;
  }
}

@media (max-width: 768px) {
  .background-glow {
    grid-template-columns: repeat(3, 1fr);
    gap: 12vh;
  }

  .glow-dot {
    width: 18vh;
    height: 18vh;
  }
}

/* 背景切换过渡：淡入淡出 + 轻微 Ken Burns */
.bgfade-enter-active, .bgfade-leave-active { transition: opacity 600ms ease; }
.bgfade-enter-from, .bgfade-leave-to { opacity: 0; }
.background-image--animate { animation: kenburns 24s ease-in-out infinite alternate; }
@keyframes kenburns {
  0% { transform: scale(1) translate3d(0,0,0); }
  100% { transform: scale(1.05) translate3d(0, -1.2%, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .background-image--animate { animation: none !important; }
  .glow-dot { animation: none !important; }
}
</style>
