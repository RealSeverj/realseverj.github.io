import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getWeatherIconName } from '../lib/weather.js'
import {
  WEATHER_CACHE_TTL,
  readWeatherCache,
  writeWeatherCache,
  getLocationByIP,
  fetchWeather,
} from '../services/weather.js'

export function useWeather() {
  const weather = ref(null)
  const loading = ref(true)
  const error = ref('')
  const adcode = ref('')
  let weatherTimer = null

  function readCache() {
    const cached = readWeatherCache()
    if (!cached) return false
    weather.value = cached.weather
    adcode.value = cached.adcode
    return cached.fresh
  }

  const weatherIconName = computed(() => getWeatherIconName(weather.value))

  async function refreshWeather(cityCode) {
    weather.value = await fetchWeather(cityCode)
    error.value = ''
    writeWeatherCache(weather.value, cityCode)
  }

  async function initWeather() {
    loading.value = true
    error.value = ''
    try {
      const cityCode = await getLocationByIP()
      adcode.value = cityCode
      await refreshWeather(cityCode)
    } catch (err) {
      console.error('天气获取失败:', err)
      error.value = '天气暂时不可用'
    } finally {
      loading.value = false
    }
  }

  function retryWeather() {
    initWeather()
  }

  onMounted(() => {
    if (readCache()) loading.value = false
    else initWeather()
    weatherTimer = setInterval(() => {
      if (adcode.value) {
        refreshWeather(adcode.value).catch(console.error)
      }
    }, WEATHER_CACHE_TTL)
  })

  onUnmounted(() => {
    if (weatherTimer) clearInterval(weatherTimer)
  })

  return {
    weather,
    loading,
    error,
    weatherIconName,
    retryWeather
  }
}

