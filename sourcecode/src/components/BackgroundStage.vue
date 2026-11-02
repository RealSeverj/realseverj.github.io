<script setup>
import { computed, ref } from 'vue'
import { useDisplayedImage } from '../composables/useDisplayedImage.js'
import { useBackgroundParallax } from '../composables/useBackgroundParallax.js'

const props = defineProps({
  image: { type: String, default: '' },
  blur: { type: Number, default: 0 },
  overlay: { type: String, default: 'transparent' }
})

const stageRef = ref(null)
const displayedImage = useDisplayedImage(() => props.image)
const hasOverlay = computed(() => Boolean(props.overlay) && props.overlay !== 'transparent')
useBackgroundParallax(stageRef)
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
  background: radial-gradient(80% 60% at 22% 28%, rgba(16, 48, 64, 0.12), transparent 70%);
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
    background: linear-gradient(180deg, rgba(14, 42, 56, 0.18) 0%, rgba(14, 42, 56, 0.06) 55%, transparent 100%);
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
