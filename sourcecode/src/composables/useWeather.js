import { ref, computed, onMounted, onUnmounted } from 'vue'

const AMAP_KEY = '19a90f1c901dec314ac2c40ced3031a0'

export function useWeather() {
  const weather = ref(null)
  const loading = ref(true)
  const error = ref('')
  const adcode = ref('')
  let weatherTimer = null

  const weatherIconName = computed(() => {
    if (!weather.value) return 'cloud'
    const w = weather.value.weather || ''
    if (w.includes('晴')) return 'sun'
    if (w.includes('云')) return 'cloud-sun'
    if (w.includes('阴')) return 'cloud'
    if (w.includes('雨')) return 'rain'
    if (w.includes('雪')) return 'snow'
    if (w.includes('雾') || w.includes('霾')) return 'fog'
    if (w.includes('雷')) return 'thunder'
    return 'cloud'
  })

  async function getLocationByIP() {
    if (!AMAP_KEY) throw new Error('请配置高德 API Key')
    const res = await fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`)
    const data = await res.json()
    if (data.status === '1' && data.adcode) {
      adcode.value = data.adcode
      return data.adcode
    }
    throw new Error(data.info || '定位失败')
  }

  async function fetchWeather(cityCode) {
    if (!AMAP_KEY) throw new Error('请配置高德 API Key')
    const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${cityCode}`)
    const data = await res.json()
    if (data.status === '1' && data.lives && data.lives.length > 0) {
      weather.value = data.lives[0]
      error.value = ''
    } else {
      throw new Error(data.info || '获取天气失败')
    }
  }

  async function initWeather() {
    loading.value = true
    error.value = ''
    try {
      const cityCode = await getLocationByIP()
      await fetchWeather(cityCode)
    } catch (err) {
      console.error('天气获取失败:', err)
      error.value = err.message || '天气加载失败'
    } finally {
      loading.value = false
    }
  }

  function retryWeather() {
    initWeather()
  }

  onMounted(() => {
    initWeather()
    weatherTimer = setInterval(() => {
      if (adcode.value) {
        fetchWeather(adcode.value).catch(console.error)
      }
    }, 30 * 60 * 1000)
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

