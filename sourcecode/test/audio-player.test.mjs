import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import test from 'node:test'
import { useAudioPlayer } from '../src/composables/useAudioPlayer.js'
import { fetchPlaylist } from '../src/services/playlist.js'

test('歌单加载跳过 HTML 回退页与空清单，按原顺序尝试候选地址', async t => {
  const requested = []
  t.mock.method(globalThis, 'fetch', async url => {
    requested.push(url)
    if (requested.length === 1) return new Response('<html></html>', { headers: { 'content-type': 'text/html' } })
    return Response.json(requested.length === 2 ? [] : [{ id: 'track', src: '/music/track.mp3' }])
  })
  assert.deepEqual(await fetchPlaylist(), [{ id: 'track', src: '/music/track.mp3' }])
  assert.deepEqual(requested, ['/music/playlist.json', 'music/playlist.json', './music/playlist.json'])
})

test('所有歌单地址不可用时保留错误信息', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline') })
  await assert.rejects(fetchPlaylist(), /未能从已知路径获取到有效的 playlist.json/)
})

function fixture(t) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { href: 'https://example.com/' } },
  })
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else delete globalThis.window
  })
  const tracks = [
    { id: 'first', title: 'First', artist: 'Artist', src: '/music/first.mp3', lrc: '/music/first.lrc' },
    { id: 'second', title: 'Second', artist: 'Artist', src: '/music/second.mp3' },
  ]
  t.mock.method(globalThis, 'fetch', async url => url.endsWith('.lrc')
    ? new Response('[00:01.00]First line\n[00:02.50]Second line')
    : Response.json(tracks))
  const audio = {
    src: '', volume: 0, muted: false, currentTime: 0, duration: 180,
    buffered: { length: 1, end: () => 90 },
    load() {}, async play() {}, pause() {},
  }
  const player = useAudioPlayer()
  player.setAudioElement(audio)
  return { player, audio }
}

test('音轨初始化、元数据、歌词索引、进度和跳转使用相同的播放状态', async t => {
  const { player, audio } = fixture(t)
  await player.init()
  assert.equal(audio.src, '/music/first.mp3')
  assert.equal(audio.volume, 0.7)
  assert.equal(player.currentTrack.value.album, '')
  player.handleLoadedMetadata()
  assert.equal(player.playlist.value[0].duration, 180)
  audio.currentTime = 3
  player.handleTimeUpdate()
  assert.equal(player.currentLyricIndex.value, 1)
  assert.equal(player.loadedProgress.value, 50)
  assert.equal(player.playedProgress.value, 3 / 180 * 100)
  player.seek(2)
  assert.equal(audio.currentTime, 180)
  player.seek(-1)
  assert.equal(audio.currentTime, 0)
  await player.playTrack(1)
  assert.equal(player.currentIndex.value, 1)
  assert.equal(player.isPlaying.value, true)
  assert.deepEqual(player.parsedLyrics.value, [])
  player.pause()
  assert.equal(player.isPlaying.value, false)
})

test('循环模式、曲目切换和播放结束沿用原有顺序', async t => {
  const { player, audio } = fixture(t)
  await player.init()
  assert.equal(player.loopModeText.value, '列表循环')
  player.toggleLoop()
  assert.equal(player.loopModeText.value, '单曲循环')
  audio.currentTime = 30
  player.handleEnded()
  assert.equal(audio.currentTime, 0)
  player.toggleLoop()
  assert.equal(player.loopModeText.value, '不循环')
  await player.playTrack(1)
  player.handleEnded()
  assert.equal(player.isPlaying.value, false)
  player.toggleLoop()
  player.nextTrack()
  assert.equal(player.currentIndex.value, 0)
  player.previousTrack()
  assert.equal(player.currentIndex.value, 1)
  await setImmediate()
})
