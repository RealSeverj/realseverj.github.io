const AMAP_KEY = '19a90f1c901dec314ac2c40ced3031a0'
const CACHE_KEY = 'severj:weather:v1'
export const WEATHER_CACHE_TTL = 30 * 60 * 1000

/** 过期缓存仍可展示，是否立即刷新由调用方决定。 */
export function readWeatherCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null')
    if (!cached?.weather?.city || !cached?.adcode || !Number.isFinite(cached.time)) return null
    return { ...cached, fresh: Date.now() - cached.time < WEATHER_CACHE_TTL }
  } catch {
    return null
  }
}

export function writeWeatherCache(weather, adcode) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ weather, adcode, time: Date.now() }))
  } catch { /* 浏览器禁用存储时仍可展示天气。 */ }
}

export async function getLocationByIP() {
  if (!AMAP_KEY) throw new Error('请配置高德 API Key')
  const response = await fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`)
  const data = await response.json()
  if (data.status === '1' && data.adcode) return data.adcode
  throw new Error(data.info || '定位失败')
}

export async function fetchWeather(cityCode) {
  if (!AMAP_KEY) throw new Error('请配置高德 API Key')
  const response = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${cityCode}`)
  const data = await response.json()
  if (data.status === '1' && data.lives && data.lives.length > 0) return data.lives[0]
  throw new Error(data.info || '获取天气失败')
}
