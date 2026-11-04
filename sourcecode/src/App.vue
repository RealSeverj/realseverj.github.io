<script setup>
import { ref } from 'vue'
import BackgroundStage from './components/BackgroundStage.vue'
import PetalBreeze from './components/PetalBreeze.vue'
import CustomCursor from './components/CustomCursor.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import WeatherTime from './components/WeatherTime.vue'
import HomeView from './views/HomeView.vue'
import site from './site.config.js'
import { useSpotlight } from './composables/useSpotlight.js'
import { useSceneScroll } from './composables/useSceneScroll.js'

const root = ref(null)
const opening = ref(null)
const content = ref(null)
const wallpaper = site.wallpaper

useSpotlight(root)
useSceneScroll(root, opening, content)
</script>

<template>
  <div ref="root" class="page">
    <BackgroundStage :image="wallpaper.image" :blur="wallpaper.blur" :overlay="wallpaper.overlay" />
    <PetalBreeze />
    <CustomCursor />
    <a class="skip-link" href="#discover">跳到主页内容</a>

    <header class="header">
      <a class="brand" href="#opening" aria-label="Severj.top，返回主页">Severj<span>.top</span></a>
      <nav class="header__nav" aria-label="主导航">
        <a href="#site">站点</a>
        <a href="#friends">朋友</a>
        <a href="#articles">文章</a>
        <a class="back-to-scene" href="#opening">返回主页</a>
      </nav>
    </header>

    <section id="opening" ref="opening" class="opening" aria-label="花田，时间与音乐">
      <div class="opening__time">
        <WeatherTime ambient />
        <p class="opening__tagline">A Place No One Has Found</p>
        <a class="scroll-cue" href="#discover">
          <span>向下滚动，随处逛逛</span>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 4v15m-5-5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
      <div id="opening-lyrics" class="opening__lyrics" aria-label="当前歌词"></div>
      <div class="opening__music">
        <MusicPlayer ambient lyrics-target="#opening-lyrics" />
      </div>
      <span class="scene-caption">我挚爱的时光</span>
    </section>

    <main id="discover" ref="content" class="main" tabindex="-1">
      <HomeView />
    </main>
    <footer class="footer">
      <a class="footer__home" href="#opening">返回主页</a>
      <span>© {{ new Date().getFullYear() }} Severj.top</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">闽ICP备2025122655号</a>
    </footer>
  </div>
</template>

<style scoped>
.page {
  --scene-progress: 0;
  --scene-ink: rgba(248, 253, 255, 0.96);
  --scene-text-shadow:
    0 1px 5px rgba(16, 48, 64, calc((1 - var(--scene-progress)) * 0.5)),
    0 4px 16px rgba(16, 48, 64, calc((1 - var(--scene-progress)) * 0.3));
  /* 首屏统一左右边距：品牌、时钟、歌词、播放器共用 */
  --gutter: clamp(36px, 7vw, 140px);
  /* 第二屏内容容器（min(1200px, 90%)）的左边缘 */
  --content-inset: max(5%, calc((100% - 1200px) / 2));
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
  /* 首屏对齐时钟左缘，滚入第二屏后平滑过渡到内容容器左缘 */
  padding: 0 calc(var(--gutter) * (1 - var(--scene-progress)) + var(--content-inset) * var(--scene-progress));
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
  /* 亮色壁纸上也要托住文字：顶部始终保留一层很淡的深色渐变，滚动后加深 */
  background: linear-gradient(rgba(9, 21, 29, 0.9), rgba(9, 21, 29, 0));
  opacity: calc(0.3 + var(--scene-progress) * 0.7);
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
  /* 不再使用背景模糊：靠更深一点的青色着色托住亮背景下的文字对比度 */
  background:
    linear-gradient(
      160deg,
      rgba(255, 255, 255, calc(0.14 - var(--scene-progress) * 0.09)) 0%,
      rgba(255, 255, 255, calc(0.04 - var(--scene-progress) * 0.02)) 100%
    ),
    rgba(14, 60, 80, calc(0.24 - var(--scene-progress) * 0.18));
  border: 1px solid rgba(255, 255, 255, calc(0.3 - var(--scene-progress) * 0.14));
  border-radius: var(--radius-pill);
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, calc(0.34 - var(--scene-progress) * 0.14)),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 4px 18px rgba(8, 28, 40, calc(0.16 * (1 - var(--scene-progress))));
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
  color: rgb(231, 245, 249);
  font-weight: 500;
  letter-spacing: 0.03em;
  white-space: nowrap;
  text-shadow: 0 1px 4px rgba(8, 28, 40, 0.5);
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
  left: var(--gutter);
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
  left: var(--gutter);
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
  left: var(--gutter);
  bottom: 62px;
  width: min(400px, 40vw);
}
/* 滚动提示：收进左栏，紧跟标语，避开画面中心的人物与书本 */
.scroll-cue {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: rgba(243, 251, 255, 0.88);
  text-shadow: 0 1px 7px rgba(16, 43, 56, 0.55);
  transition: color 180ms ease;
}
.scroll-cue:hover { color: #ffffff; }
.scroll-cue svg { transition: transform 200ms ease; }
.scroll-cue:hover svg { transform: translateY(3px); }
/* 与左下角播放器底边对齐到同一条基线 */
.scene-caption { position: absolute; right: var(--gutter); bottom: 62px; font-size: 0.74rem; letter-spacing: 0.22em; color: rgba(245, 251, 253, 0.8); text-shadow: 0 1px 8px rgba(20, 45, 59, 0.5); }
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
.footer__home { margin-right: auto; color: var(--fg); font-size: 0.9rem; letter-spacing: 0.04em; transition: color 180ms ease; }
.footer a:hover { color: var(--fg-strong); }
.skip-link { position: fixed; z-index: 50; top: 12px; left: 12px; padding: 10px 16px; background: #153743; color: white; transform: translateY(-150%); border-radius: 6px; }
.skip-link:focus { transform: translateY(0); }
@media (max-width: 768px) {
  /* 移动端首屏与内容区（90% 宽）统一使用 5% 边距 */
  .page { --gutter: 5%; }
  .header { min-height: 72px; justify-content: space-between; gap: 12px; }
  .header__nav { padding: 3px 5px; gap: 2px; }
  .header__nav a { padding: 6px 12px; font-size: 0.82rem; }
  .back-to-scene { display: none; }
  .opening { min-height: 560px; }
  .opening__time { top: 23%; }
  .opening__tagline { font-size: 1.02rem; letter-spacing: 0.045em; margin-top: 22px; }
  .opening__music { bottom: 118px; width: min(360px, 90%); }
  .opening__lyrics { bottom: 254px; width: 90%; }
  .scroll-cue { margin-top: 18px; }
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
