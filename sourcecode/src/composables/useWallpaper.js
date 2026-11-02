import { ref } from 'vue'
import site from '../site.config.js'

export function useWallpaper() {
  const wallpaperConfig = site.wallpaper || {}
  const fallbackImages = Array.from({ length: 10 }, (_, i) => `/img/backgrounds/background${i + 1}.webp`)
  const images = wallpaperConfig.image ? [wallpaperConfig.image] : fallbackImages

  const currentIndex = ref(0)
  const selectedImage = ref('')

  function showImage(index) {
    if (!images.length) return
    currentIndex.value = ((index % images.length) + images.length) % images.length
    selectedImage.value = images[currentIndex.value]
  }

  function pickRandomIndex() {
    showImage(Math.floor(Math.random() * images.length))
  }

  function nextImage() {
    showImage(currentIndex.value + 1)
  }

  return {
    wallpaperConfig,
    currentIndex,
    selectedImage,
    pickRandomIndex,
    nextImage,
    showImage
  }
}

