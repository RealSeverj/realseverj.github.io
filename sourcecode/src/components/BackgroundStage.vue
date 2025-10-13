<template>
  <div class="background-stage" role="presentation">
    <div class="background-gradient"></div>
    <transition name="bgfade" mode="in-out">
      <div :key="displayedImage || 'noimg'" class="background-image" :class="{ 'background-image--hidden': !displayedImage, 'background-image--loaded': imageLoaded, 'background-image--animate': imageLoaded }" :style="imageStyle"></div>
    </transition>
    <div class="background-overlay"></div>
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
    default: 'rgba(6, 10, 26, 0.62)'
  }
})

const dots = Array.from({ length: 12 }, (_, index) => index)

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
        // 可根据需要回退到纯背景：displayedImage.value = ''
        imageLoaded.value = true
      }
    }
    img.src = newSrc
  },
  { immediate: true }
)

const imageStyle = computed(() => {
  // 由于采用预加载，显示时即为“已加载”，一般不需要额外模糊
  const style = { filter: 'none' }
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
  background: radial-gradient(120% 120% at 85% 10%, rgba(135, 206, 250, 0.4) 0%, transparent 55%),
    radial-gradient(80% 80% at 20% 20%, rgba(173, 216, 230, 0.35) 0%, transparent 60%),
    radial-gradient(75% 75% at 50% 85%, rgba(70, 130, 180, 0.32) 0%, transparent 60%),
    #191a1b;
  transform: scale(1.1);
  filter: saturate(120%);
}

.background-image {
  position: absolute;
  inset: -5%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 600ms ease;
  will-change: transform, opacity;
  contain: paint;
  transform: translateZ(0);
}

.background-image--loaded {
  opacity: 0.45;
}

.background-image--hidden {
  opacity: 0;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(3, 7, 17, 0.85) 0%, rgba(3, 7, 17, 0.4) 45%, rgba(3, 7, 17, 0.85) 100%);
}

.background-glow {
  position: absolute;
  inset: -10%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16vh;
  transform: rotate(-8deg);
  pointer-events: none;
}

.glow-dot {
  width: 22vh;
  height: 22vh;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0) 70%);
  animation: pulse 9s ease-in-out infinite;
  opacity: 0.4;
}

.glow-dot:nth-child(odd) {
  animation-delay: 2.4s;
  opacity: 0.28;
}

.glow-dot:nth-child(even) {
  animation-delay: 5.1s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.85) translate3d(0, 0, 0);
    opacity: 0.2;
  }
  40% {
    transform: scale(1.2) translate3d(0, -12%, 0);
    opacity: 0.45;
  }
  70% {
    transform: scale(1) translate3d(0, 8%, 0);
    opacity: 0.35;
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
  100% { transform: scale(1.06) translate3d(0, -1.5%, 0); }
}

/* 系统偏好减少动效时，关闭动画以降功耗 */
@media (prefers-reduced-motion: reduce) {
  .background-image--animate { animation: none !important; }
  .glow-dot { animation: none !important; }
}
</style>
