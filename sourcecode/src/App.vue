<script setup>
import { ref, onMounted } from 'vue'
import BackgroundStage from './components/BackgroundStage.vue'
import PetalBreeze from './components/PetalBreeze.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import WeatherTime from './components/WeatherTime.vue'
import HomeView from './views/HomeView.vue'
import { useWallpaper } from './composables/useWallpaper.js'
import { useSpotlight } from './composables/useSpotlight.js'
import { useSceneScroll } from './composables/useSceneScroll.js'

const root = ref(null)
const opening = ref(null)
const content = ref(null)
const { wallpaperConfig, selectedImage, pickRandomIndex } = useWallpaper()

useSpotlight(root)
useSceneScroll(root, opening, content)
onMounted(pickRandomIndex)
</script>

<template>
  <div ref="root" class="page">
    <BackgroundStage :image="selectedImage" :blur="wallpaperConfig.blur" :overlay="wallpaperConfig.overlay" />
    <PetalBreeze />
    <a class="skip-link" href="#discover">跳到主页内容</a>

    <header class="header">
      <a class="brand" href="#opening" aria-label="Severj.top，回到花田">Severj<span>.top</span></a>
      <nav class="header__nav" aria-label="主导航">
        <a href="#site">站点</a>
        <a href="#friends">朋友</a>
        <a href="#articles">文章</a>
        <a class="back-to-scene" href="#opening">回到花田 <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <section id="opening" ref="opening" class="opening" aria-label="花田，时间与音乐">
      <div class="opening__time">
        <WeatherTime ambient />
        <p class="opening__tagline">A Place No One Has Found</p>
      </div>
      <div id="opening-lyrics" class="opening__lyrics" aria-label="当前歌词"></div>
      <div class="opening__music">
        <MusicPlayer ambient lyrics-target="#opening-lyrics" />
      </div>
      <a class="scroll-cue" href="#discover">
        <span>向下滚动，随处逛逛</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 4v15m-5-5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
      <span class="scene-caption">我挚爱的时光</span>
    </section>

    <main id="discover" ref="content" class="main" tabindex="-1">
      <HomeView />
    </main>
    <footer class="footer">
      <a class="footer__home" href="#opening">Severj.top <span aria-hidden="true">↑</span></a>
      <span>© {{ new Date().getFullYear() }} Severj.top</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">闽ICP备2025122655号</a>
    </footer>
  </div>
</template>

<style scoped>
.page {
  --scene-progress: 0;
  --scene-ink: rgba(248, 253, 255, 0.96);
  --nav-ink: rgb(220, 246, 253);
  --scene-text-shadow:
    0 1px 5px rgba(16, 48, 64, calc((1 - var(--scene-progress)) * 0.38)),
    0 4px 16px rgba(16, 48, 64, calc((1 - var(--scene-progress)) * 0.2));
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
}
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 20;
  min-height: 84px;
  padding: 0 clamp(24px, 5vw, 96px);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: clamp(20px, 3vw, 42px);
  color: var(--scene-ink);
  transition: color 240ms ease;
}
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(rgba(9, 21, 29, 0.9), rgba(9, 21, 29, 0));
  opacity: var(--scene-progress);
  pointer-events: none;
}
.brand {
  font-size: 1.16rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--scene-ink);
  text-shadow: var(--scene-text-shadow);
  transition: opacity 180ms ease, color 240ms ease;
}
.brand span { font-weight: 500; opacity: 0.78; }
.brand:hover { opacity: 0.82; }

.header__nav {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, calc(0.18 - var(--scene-progress) * 0.13)) 0%,
    rgba(255, 255, 255, calc(0.06 - var(--scene-progress) * 0.04)) 100%
  );
  border: 1px solid rgba(255, 255, 255, calc(0.32 - var(--scene-progress) * 0.18));
  border-radius: var(--radius-pill);
  backdrop-filter: blur(10px) saturate(115%);
  -webkit-backdrop-filter: blur(10px) saturate(115%);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, calc(0.38 - var(--scene-progress) * 0.16)),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  font-size: 0.88rem;
  line-height: 1.5;
  transition: border-color var(--dur-base) ease, box-shadow var(--dur-base) ease;
}
.header__nav:hover {
  border-color: rgba(255, 255, 255, calc(0.42 - var(--scene-progress) * 0.18));
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.44),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.header__nav a {
  position: relative;
  padding: 6px 15px;
  border-radius: var(--radius-pill);
  color: var(--nav-ink);
  font-weight: 500;
  letter-spacing: 0.03em;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(14, 42, 56, 0.16);
  transition: background var(--dur-fast) ease, color var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
}
.header__nav a:hover {
  background: rgba(255, 255, 255, calc(0.24 - var(--scene-progress) * 0.16));
  color: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
.back-to-scene {
  margin-left: 6px;
}
.back-to-scene::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  width: 1px;
  height: 13px;
  background: currentColor;
  opacity: 0.22;
  transform: translateY(-50%);
}
.back-to-scene span { margin-left: 5px; opacity: 0.75; }
.opening {
  position: relative;
  height: 100vh;
  height: 100svh;
  min-height: 600px;
  color: rgba(248, 253, 255, 0.96);
}
.opening__time {
  position: absolute;
  top: 23%;
  left: clamp(36px, 7vw, 140px);
  opacity: var(--intro-opacity, 1);
  transform: translate3d(0, calc(var(--scene-progress) * -22px), 0);
  will-change: transform, opacity;
}
.opening__tagline {
  margin: 26px 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.16rem;
  font-style: italic;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: 0.06em;
  color: rgba(246, 252, 255, 0.92);
  text-shadow:
    0 1px 6px rgba(16, 48, 64, 0.38),
    0 4px 16px rgba(16, 48, 64, 0.2);
}
.opening__lyrics {
  position: absolute;
  left: clamp(36px, 7vw, 140px);
  bottom: 208px;
  width: min(600px, 44vw);
  opacity: var(--intro-opacity, 1);
  transform: translate3d(0, calc(var(--scene-progress) * -18px), 0);
  will-change: transform, opacity;
  pointer-events: none;
}
.opening__music {
  position: absolute;
  z-index: 10;
  left: clamp(36px, 7vw, 140px);
  bottom: 62px;
  width: min(400px, 40vw);
}
.scroll-cue {
  position: absolute;
  bottom: 44px;
  left: 50%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 14px;
  transform: translate3d(-50%, calc(var(--scene-progress) * -14px), 0);
  will-change: transform, opacity;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: #f3fbff;
  text-shadow: 0 1px 7px rgba(16, 43, 56, 0.55);
  opacity: var(--intro-opacity, 1);
}
.scroll-cue svg { transition: transform 200ms ease; }
.scroll-cue:hover svg { transform: translateY(4px); }
.scene-caption { position: absolute; right: 5vw; bottom: 46px; font-size: 0.74rem; letter-spacing: 0.22em; color: rgba(245, 251, 253, 0.8); text-shadow: 0 1px 8px rgba(20, 45, 59, 0.5); }
.main { position: relative; width: min(1200px, 90%); margin: 0 auto; padding: 76px 0 48px; scroll-margin-top: 24px; }
.footer {
  position: relative;
  width: min(1200px, 90%);
  margin: 0 auto;
  padding: 28px 0 32px;
  border-top: 1px solid rgba(225, 242, 250, 0.14);
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  color: var(--fg-subtle);
  font-size: 0.75rem;
}
.footer__home { margin-right: auto; color: var(--fg); font-size: 0.9rem; }
.footer__home span { margin-left: 12px; }
.footer a:hover { color: var(--fg-strong); }
.skip-link { position: fixed; z-index: 50; top: 12px; left: 12px; padding: 10px 16px; background: #153743; color: white; transform: translateY(-150%); border-radius: 6px; }
.skip-link:focus { transform: translateY(0); }
@media (max-width: 768px) {
  .header { min-height: 72px; padding-inline: 20px; justify-content: space-between; gap: 12px; }
  .header__nav { padding: 3px 5px; gap: 2px; }
  .header__nav a { padding: 6px 12px; font-size: 0.82rem; }
  .back-to-scene { display: none; }
  .opening { min-height: 560px; }
  .opening__time { top: 23%; left: 7%; }
  .opening__tagline { font-size: 1.02rem; letter-spacing: 0.045em; margin-top: 22px; }
  .opening__music { left: 7%; bottom: 118px; width: min(360px, 86%); }
  .opening__lyrics { left: 7%; bottom: 254px; width: 86%; }
  .scroll-cue { bottom: 30px; width: max-content; }
  .scene-caption { display: none; }
  .main { width: 90%; padding-top: 40px; }
  .footer { width: 90%; gap: 12px 20px; }
  .footer__home { width: 100%; }
}
@media (min-width: 769px) and (max-height: 740px) {
  .opening__time { top: 19%; }
  .opening__tagline { margin-top: 18px; }
  .opening__lyrics { bottom: 192px; }
}
@media (max-height: 660px) {
  .opening__tagline { display: none; }
  .opening__time :deep(.clock-line) { font-size: 6rem; }
}
</style>
