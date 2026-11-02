/** 保留天气描述的原有匹配顺序，包括“雷阵雨”优先使用雨图标。 */
export function getWeatherIconName(weather) {
  if (!weather) return 'cloud'
  const description = weather.weather || ''
  if (description.includes('晴')) return 'sun'
  if (description.includes('云')) return 'cloud-sun'
  if (description.includes('阴')) return 'cloud'
  if (description.includes('雨')) return 'rain'
  if (description.includes('雪')) return 'snow'
  if (description.includes('雾') || description.includes('霾')) return 'fog'
  if (description.includes('雷')) return 'thunder'
  return 'cloud'
}
