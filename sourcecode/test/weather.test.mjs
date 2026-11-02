import assert from 'node:assert/strict'
import test from 'node:test'
import { getWeatherIconName } from '../src/lib/weather.js'
import { WEATHER_CACHE_TTL, readWeatherCache, writeWeatherCache, getLocationByIP, fetchWeather } from '../src/services/weather.js'

test('天气图标保留描述匹配顺序和默认图标', () => {
  for (const [description, icon] of [
    ['晴', 'sun'], ['多云', 'cloud-sun'], ['阴', 'cloud'], ['雷阵雨', 'rain'],
    ['雪', 'snow'], ['雾', 'fog'], ['霾', 'fog'], ['雷', 'thunder'], ['', 'cloud'],
  ]) assert.equal(getWeatherIconName({ weather: description }), icon, description)
  assert.equal(getWeatherIconName(null), 'cloud')
})

test('天气缓存区分半小时有效期，过期数据仍可读取，存储不可用时不影响调用', t => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) },
  })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'sessionStorage', original)
    else delete globalThis.sessionStorage
  })
  let now = 1000
  t.mock.method(Date, 'now', () => now)
  const weather = { city: '厦门市', weather: '晴' }
  writeWeatherCache(weather, '350200')
  assert.equal(readWeatherCache().fresh, true)
  now += WEATHER_CACHE_TTL
  const expired = readWeatherCache()
  assert.equal(expired.fresh, false)
  assert.deepEqual(expired.weather, weather)
  assert.equal(expired.adcode, '350200')
  sessionStorage.getItem = () => '{invalid'
  assert.equal(readWeatherCache(), null)
  sessionStorage.setItem = () => { throw new Error('storage blocked') }
  assert.doesNotThrow(() => writeWeatherCache(weather, '350200'))
})

test('天气请求沿用定位城市与高德错误信息', async t => {
  t.mock.method(globalThis, 'fetch', async url => {
    if (url.includes('/ip?')) return Response.json({ status: '1', adcode: '350200' })
    assert.ok(url.includes('&city=350200'))
    return Response.json({ status: '1', lives: [{ city: '厦门市', weather: '晴' }] })
  })
  const city = await getLocationByIP()
  assert.equal(city, '350200')
  assert.deepEqual(await fetchWeather(city), { city: '厦门市', weather: '晴' })
  t.mock.method(globalThis, 'fetch', async () => Response.json({ status: '0', info: 'API error' }))
  await assert.rejects(getLocationByIP(), /API error/)
  await assert.rejects(fetchWeather(city), /API error/)
})
