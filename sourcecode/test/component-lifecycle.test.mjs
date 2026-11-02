import assert from 'node:assert/strict'
import test from 'node:test'
import { createRenderer, nextTick, ref } from 'vue'
import { useDisplayedImage } from '../src/composables/useDisplayedImage.js'
import { useMusicDetails } from '../src/composables/useMusicDetails.js'
import { useModalFrame } from '../src/composables/useModalFrame.js'
import { useBackgroundParallax } from '../src/composables/useBackgroundParallax.js'
import { usePetalWind } from '../src/composables/usePetalWind.js'

// 只挂载 composable 的生命周期；不依赖浏览器 DOM 或额外测试框架。
function mount(t, setup) {
  const renderer = createRenderer({
    createComment: () => ({}), insert() {}, remove() {},
  })
  let state
  const app = renderer.createApp({ setup() { state = setup(); return () => null } })
  app.mount({})
  let mounted = true
  const unmount = () => {
    if (mounted) app.unmount()
    mounted = false
  }
  t.after(unmount)
  return { state, unmount }
}

function installGlobal(t, name, value) {
  const original = Object.getOwnPropertyDescriptor(globalThis, name)
  Object.defineProperty(globalThis, name, { configurable: true, value })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, name, original)
    else delete globalThis[name]
  })
}

function eventTarget() {
  const listeners = new Map()
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type).add(listener)
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener) },
    dispatch(type, event = {}) { for (const listener of listeners.get(type) || []) listener(event) },
    count() { return [...listeners.values()].reduce((sum, values) => sum + values.size, 0) },
  }
}

test('图片切换忽略过期加载回调，卸载后不再更新显示图片', async t => {
  const images = []
  installGlobal(t, 'Image', class { constructor() { images.push(this) } })
  const source = ref('/first.webp')
  const { state: displayedImage, unmount } = mount(t, () => useDisplayedImage(() => source.value))
  source.value = '/second.webp'
  await nextTick()
  images[1].onload()
  images[0].onload()
  assert.equal(displayedImage.value, '/second.webp')
  source.value = '/third.webp'
  await nextTick()
  unmount()
  images[2].onload()
  assert.equal(displayedImage.value, '/second.webp')
})

test('歌单开关保留焦点、Escape、外部点击和滚动关闭，卸载时移除监听', async t => {
  const document = eventTarget()
  const window = eventTarget()
  installGlobal(t, 'document', document)
  installGlobal(t, 'window', window)
  const { state, unmount } = mount(t, useMusicDetails)
  let focused = ''
  state.detailsClose.value = { focus: () => { focused = 'close' } }
  state.detailsToggle.value = { focus: () => { focused = 'toggle' } }
  state.container.value = { contains: target => target === 'inside' }
  await state.toggleDetails()
  assert.equal(state.showDetails.value, true)
  assert.equal(focused, 'close')
  document.dispatch('pointerdown', { target: 'inside' })
  assert.equal(state.showDetails.value, true)
  let prevented = false
  document.dispatch('keydown', { key: 'Escape', preventDefault: () => { prevented = true } })
  assert.equal(state.showDetails.value, false)
  assert.equal(focused, 'toggle')
  assert.equal(prevented, true)
  await state.toggleDetails()
  document.dispatch('pointerdown', { target: 'outside' })
  assert.equal(state.showDetails.value, false)
  await state.toggleDetails()
  window.dispatch('scroll')
  assert.equal(state.showDetails.value, false)
  unmount()
  assert.equal(document.count() + window.count(), 0)
})

test('弹窗保留加载超时、焦点循环、Escape 和页面滚动恢复', t => {
  const window = eventTarget()
  const document = { body: { style: { overflow: 'auto' } }, activeElement: null }
  installGlobal(t, 'window', window)
  installGlobal(t, 'document', document)
  let timeout
  let cleared = 0
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    assert.equal(delay, 2500)
    timeout = callback
    return 1
  })
  t.mock.method(globalThis, 'clearTimeout', () => { cleared++ })
  let closed = 0
  const { state, unmount } = mount(t, () => useModalFrame({ src: '/components/demo/', width: 800, height: '85vh' }, () => { closed++ }))
  assert.equal(document.body.style.overflow, 'hidden')
  assert.deepEqual(state.winStyle.value, { width: '800px', height: '85vh' })
  timeout()
  assert.equal(state.blocked.value, true)
  state.onLoad()
  assert.equal(state.loading.value, false)
  const first = { focus: () => { document.activeElement = first } }
  const last = { focus: () => { document.activeElement = last } }
  state.win.value = { querySelectorAll: () => [first, last] }
  document.activeElement = last
  window.dispatch('keydown', { key: 'Tab', preventDefault() {} })
  assert.equal(document.activeElement, first)
  window.dispatch('keydown', { key: 'Tab', shiftKey: true, preventDefault() {} })
  assert.equal(document.activeElement, last)
  window.dispatch('keydown', { key: 'Escape', preventDefault() {} })
  assert.equal(closed, 1)
  unmount()
  assert.equal(document.body.style.overflow, 'auto')
  assert.equal(window.count(), 0)
  assert.equal(cleared, 2)
})

test('背景视差和微风遵守减少动态效果设置，卸载时清理动画帧与监听', t => {
  const window = eventTarget()
  let reduced = true
  window.matchMedia = () => ({ matches: reduced })
  installGlobal(t, 'window', window)
  let nextFrame = 0
  const frames = new Set()
  installGlobal(t, 'requestAnimationFrame', () => { frames.add(++nextFrame); return nextFrame })
  installGlobal(t, 'cancelAnimationFrame', id => frames.delete(id))
  const element = ref(null)
  const setup = () => { useBackgroundParallax(element); usePetalWind(element) }
  const first = mount(t, setup)
  assert.equal(frames.size, 0)
  first.unmount()
  assert.equal(window.count(), 0)
  reduced = false
  const second = mount(t, setup)
  assert.equal(frames.size, 2)
  assert.equal(window.count(), 2)
  second.unmount()
  assert.equal(frames.size, 0)
  assert.equal(window.count(), 0)
})
