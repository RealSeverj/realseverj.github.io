<template>
  <div class="weather-time">
    <div class="time-display">
      <div class="date-line">
        {{ dateText }}
        <span class="weekday">{{ weekdayText }}</span>
      </div>
      <div class="clock-line">{{ timeText }}</div>
    </div>
    
    <div v-if="weather" class="weather-display">
      <div class="weather-main">
        <i :class="weatherIcon" class="weather-icon"></i>
        <span class="weather-text">{{ weather.weather }}</span>
        <span class="temperature">{{ weather.temperature }}°C</span>
      </div>
      <div class="weather-details">
        <span class="location">{{ weather.city }}</span>
        <span class="wind">{{ weather.winddirection }}风 {{ weather.windpower }}级</span>
        <span class="humidity">湿度 {{ weather.humidity }}%</span>
      </div>
    </div>
    
    <div v-else-if="loading" class="weather-loading">
      <span class="loader-dot"></span>
      <span>加载天气中...</span>
    </div>
    
    <div v-else-if="error" class="weather-error" @click="retryWeather">
      <i class="fa-solid fa-circle-exclamation"></i>
      <span>{{ error }}</span>
      <span class="retry-hint">(点击重试)</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// 配置项 - 用户需要填入自己的高德 API Key
const AMAP_KEY = '19a90f1c901dec314ac2c40ced3031a0'

const now = ref(new Date())
const weather = ref(null)
const loading = ref(true)
const error = ref('')
const adcode = ref('')

// 时间格式化
const dateText = computed(() => {
  const y = now.value.getFullYear()
  const m = now.value.getMonth() + 1
  const d = now.value.getDate()
  return `${y} 年 ${m} 月 ${d < 10 ? '0' + d : d} 日`
})

const weekdayText = computed(() => {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return days[now.value.getDay()]
})

const timeText = computed(() => {
  const h = String(now.value.getHours()).padStart(2, '0')
  const m = String(now.value.getMinutes()).padStart(2, '0')
  const s = String(now.value.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
})

// 天气图标映射
const weatherIcon = computed(() => {
  if (!weather.value) return 'fa-solid fa-cloud'
  const w = weather.value.weather
  if (w.includes('晴')) return 'fa-solid fa-sun'
  if (w.includes('云')) return 'fa-solid fa-cloud-sun'
  if (w.includes('阴')) return 'fa-solid fa-cloud'
  if (w.includes('雨')) return 'fa-solid fa-cloud-rain'
  if (w.includes('雪')) return 'fa-solid fa-snowflake'
  if (w.includes('雾') || w.includes('霾')) return 'fa-solid fa-smog'
  if (w.includes('雷')) return 'fa-solid fa-cloud-bolt'
  return 'fa-solid fa-cloud'
})

// 更新时间
let timeTimer = null
function updateTime() {
  now.value = new Date()
}

// 获取 IP 位置 (使用高德 IP 定位 API)
async function getLocationByIP() {
  try {
    if (!AMAP_KEY) {
      throw new Error('请配置高德 API Key')
    }
    
    const res = await fetch(
      `https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`
    )
    const data = await res.json()
    
    if (data.status === '1' && data.adcode) {
      adcode.value = data.adcode
      return data.adcode
    } else {
      throw new Error(data.info || '定位失败')
    }
  } catch (err) {
    console.error('IP 定位失败:', err)
    throw err
  }
}

// 获取天气信息
async function fetchWeather(cityCode) {
  try {
    if (!AMAP_KEY) {
      throw new Error('请配置高德 API Key')
    }
    
    const res = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${cityCode}`
    )
    const data = await res.json()
    
    if (data.status === '1' && data.lives && data.lives.length > 0) {
      weather.value = data.lives[0]
      error.value = ''
    } else {
      throw new Error(data.info || '获取天气失败')
    }
  } catch (err) {
    console.error('获取天气失败:', err)
    error.value = err.message || '天气加载失败'
  }
}

// 初始化天气
async function initWeather() {
  loading.value = true
  error.value = ''
  
  try {
    const cityCode = await getLocationByIP()
    await fetchWeather(cityCode)
  } catch (err) {
    error.value = err.message || '天气加载失败'
  } finally {
    loading.value = false
  }
}

// 重试获取天气
function retryWeather() {
  initWeather()
}

// 定时更新天气 (每 30 分钟)
let weatherTimer = null
function startWeatherUpdate() {
  weatherTimer = setInterval(() => {
    if (adcode.value) {
      fetchWeather(adcode.value)
    }
  }, 30 * 60 * 1000)
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  initWeather()
  startWeatherUpdate()
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  if (weatherTimer) clearInterval(weatherTimer)
})
</script>

<style scoped>
.weather-time {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 22px;
  background: linear-gradient(135deg, rgba(20, 26, 54, 0.45), rgba(16, 22, 48, 0.35));
  border: 1px solid rgba(130, 156, 248, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(226, 234, 255, 0.95);
  min-width: 280px;
}

.time-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-line {
  font-size: 0.95rem;
  color: rgba(198, 206, 240, 0.75);
  font-weight: 400;
}

.weekday {
  margin-left: 8px;
  color: rgba(173, 194, 255, 0.85);
}

.clock-line {
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
  color: rgba(240, 244, 255, 0.98);
}

.weather-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(130, 156, 248, 0.18);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
}

.weather-icon {
  font-size: 1.4rem;
  color: rgba(255, 215, 120, 0.9);
}

.weather-text {
  color: rgba(226, 234, 255, 0.92);
  font-weight: 500;
}

.temperature {
  margin-left: auto;
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(118, 255, 214, 0.95);
}

.weather-details {
  display: flex;
  gap: 12px;
  font-size: 0.88rem;
  color: rgba(198, 206, 240, 0.7);
}

.location {
  color: rgba(173, 194, 255, 0.8);
}

.weather-loading,
.weather-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  font-size: 0.9rem;
  color: rgba(198, 206, 240, 0.7);
  border-top: 1px solid rgba(130, 156, 248, 0.18);
}

.loader-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(118, 255, 214, 0.8);
  animation: pulse-dot 1.4s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

.weather-error {
  cursor: pointer;
  color: rgba(255, 180, 160, 0.8);
  transition: color 180ms ease;
}

.weather-error:hover {
  color: rgba(255, 200, 180, 0.95);
}

.retry-hint {
  margin-left: auto;
  font-size: 0.82rem;
  color: rgba(173, 194, 255, 0.6);
}

@media (max-width: 768px) {
  .weather-time {
    min-width: 0;
    width: 100%;
  }
  
  .clock-line {
    font-size: 1.5rem;
  }
  
  .weather-details {
    flex-wrap: wrap;
  }
}
</style>