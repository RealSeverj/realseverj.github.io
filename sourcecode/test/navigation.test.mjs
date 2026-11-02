import assert from 'node:assert/strict'
import test from 'node:test'
import { useLinkNavigation } from '../src/composables/useLinkNavigation.js'
import { decorateLinks, inferLinkIcon, resolveLinkImage } from '../src/lib/links.js'

test('独立子站在小窗打开，外链新开窗口，普通地址原地跳转', t => {
  const opened = []
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { open: (...args) => opened.push(args), location: { href: '/' } },
  })
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else delete globalThis.window
  })

  const { modalSrc, handleLinkClick } = useLinkNavigation()
  for (const href of ['/components/demo/', './components/demo/']) {
    handleLinkClick({ href })
    assert.equal(modalSrc.value, '/components/demo/')
  }
  handleLinkClick({ href: 'https://example.com/' })
  assert.deepEqual(opened, [['https://example.com/', '_blank', 'noopener']])
  handleLinkClick({ href: '#articles' })
  assert.equal(window.location.href, '#articles')
})

test('链接装饰保留原数据，图标优先级和图片路径保持原有规则', () => {
  const links = [{ label: '缓存音乐', href: '/components/cache/' }]
  assert.deepEqual(decorateLinks(links), [{ ...links[0], intercept: true }])
  assert.equal('intercept' in links[0], false)
  assert.equal(inferLinkIcon(links[0]), 'cache')
  assert.equal(inferLinkIcon({ ...links[0], icon: 'custom' }), 'custom')
  assert.equal(inferLinkIcon({ label: '未分类' }), 'link')
  assert.equal(resolveLinkImage('img/avatar.png'), '/img/avatar.png')
  assert.equal(resolveLinkImage('/img/avatar.png'), '/img/avatar.png')
  assert.equal(resolveLinkImage('https://example.com/avatar.png'), 'https://example.com/avatar.png')
})

test('链接请求共享进行中的请求，失败后允许重试', async t => {
  const { loadLinks } = await import('../src/services/links.js?navigation-test')
  let calls = 0
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/links.json')
    assert.equal(options.cache, 'no-cache')
    calls++
    return calls === 1
      ? { ok: false, status: 503 }
      : { ok: true, json: async () => ({ sections: [{ id: 'site' }] }) }
  })
  const first = loadLinks()
  assert.equal(loadLinks(), first)
  await assert.rejects(first, /HTTP 503/)
  assert.deepEqual(await loadLinks(), [{ id: 'site' }])
  assert.deepEqual(await loadLinks(), [{ id: 'site' }])
  assert.equal(calls, 2)
})
