<script setup>
import { ref, onMounted } from 'vue'
import BackgroundStage from './components/BackgroundStage.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import ArticleList from './components/ArticleList.vue'
import WeatherTime from './components/WeatherTime.vue'
import HomeView from './views/HomeView.vue'
import { useWallpaper } from './composables/useWallpaper'
import { useResponsiveSidebar } from './composables/useResponsiveSidebar'
import { useSpotlight } from './composables/useSpotlight'

const root = ref(null)
const { wallpaperConfig, selectedImage, pickRandomIndex, nextImage } = useWallpaper()
const { isSidebarCollapsed, toggleSidebar } = useResponsiveSidebar(1200)

useSpotlight(root)

onMounted(() => {
  pickRandomIndex()
})
</script>

<template>
  <div ref="root" class="page">
    <BackgroundStage 
      :image="selectedImage" 
      :blur="wallpaperConfig.blur" 
      :overlay="wallpaperConfig.overlay" 
    />

    <header class="header">
      <div class="header__inner">
        <div class="brand">
          <span class="brand__dot" aria-hidden="true"></span>
          <span class="brand__name">Severj.top</span>
        </div>
        <div class="controls">
          <button class="ctrl-btn" type="button" @click="nextImage" aria-label="切换壁纸">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M7 6h11v11h-2V9.414l-9.293 9.293-1.414-1.414L14.586 8H7V6z"/>
            </svg>
            <span class="ctrl-label">切换壁纸</span>
          </button>
          <button class="ctrl-btn sidebar-toggle" type="button" @click="toggleSidebar" aria-label="切换侧边栏">
            <svg v-if="isSidebarCollapsed" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
            <span class="ctrl-label">{{ isSidebarCollapsed ? '显示' : '隐藏' }}侧边栏</span>
          </button>
        </div>
      </div>
    </header>

    <div :class="['content-wrapper', { 'sidebar-hidden': isSidebarCollapsed }]">
      <!-- 主内容区：独立滚动 -->
      <div class="main-scroll-container scrollbar-hidden">
        <main class="main">
          <HomeView />
        </main>
      </div>

      <!-- 侧边栏：独立滚动 -->
      <div :class="['sidebar-scroll-container', 'scrollbar-hidden', { collapsed: isSidebarCollapsed }]">
        <aside class="sidebar">
          <div class="sidebar__content">
            <WeatherTime />
            <MusicPlayer />
            <ArticleList />
          </div>
        </aside>
      </div>
    </div>

    <footer class="footer" aria-label="Footer">
      <div class="footer__inner">
        <span>
          © {{ new Date().getFullYear() }} Severj.top &nbsp;&nbsp;
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="footer__link">闽ICP备2025122655号</a>
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--header-height);
  background: transparent;
  flex-shrink: 0;
}

.header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: calc(var(--header-height) + 24px);
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(20, 26, 44, 0.14) 50%,
    transparent 100%
  );
  backdrop-filter: blur(14px) saturate(135%);
  -webkit-backdrop-filter: blur(14px) saturate(135%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.8) 45%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.8) 45%, transparent 100%);
}

.header::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.18) 50%, transparent 95%);
  pointer-events: none;
}

.header__inner {
  width: min(var(--layout-max), 94%);
  display: flex;
  position: relative;
  z-index: 1;
  align-items: center;
  justify-content: space-between;
  text-shadow: var(--text-shadow-on-photo);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  color: var(--fg);
  box-shadow: var(--shadow-chip);
}

.brand__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
  animation: pulse-dot 2.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { 
    transform: scale(0.95);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6); 
  }
  50% { 
    transform: scale(1.1);
    box-shadow: 0 0 16px rgba(255, 255, 255, 1); 
  }
}

.brand__name { 
  font-weight: 600; 
  letter-spacing: 0.02em; 
}

.controls { 
  display: flex; 
  align-items: center; 
  gap: var(--space-xs); 
}

.ctrl-btn {
  display: inline-flex; 
  align-items: center; 
  gap: var(--space-xs);
  height: 36px; 
  padding: 0 var(--space-sm); 
  border-radius: var(--radius-pill);
  color: var(--fg);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-chip);
  cursor: pointer;
  transition: transform var(--dur-fast) ease, background var(--dur-fast) ease, border-color var(--dur-fast) ease, box-shadow var(--dur-fast) ease;
}

.ctrl-btn:hover { 
  transform: translateY(-1px); 
  background: rgba(255, 255, 255, 0.15); 
  border-color: var(--border-strong);
  box-shadow: var(--shadow-chip-hover);
}

.ctrl-label { 
  font-size: .92rem; 
}

.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
  gap: var(--space-lg);
  width: min(var(--layout-max), 94%);
  margin: 0 auto;
  overflow: hidden;
  transition: grid-template-columns var(--dur-slow) var(--ease-out);
  z-index: 1;
}

/* 侧边栏隐藏时主内容占满 */
.content-wrapper.sidebar-hidden {
  grid-template-columns: 1fr 0px;
}

/* 主内容滚动容器（滚动条隐藏由 .scrollbar-hidden 提供） */
.main-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  min-width: 0;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.main {
  min-width: 0;
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: calc(var(--header-height) + var(--space-lg)) 0 calc(var(--footer-height) + var(--space-lg));
  transition: max-width var(--dur-slow) var(--ease-out);
}

.content-wrapper.sidebar-hidden .main {
  max-width: calc(var(--content-max) + 100px);
}

/* 侧边栏滚动容器（滚动条隐藏由 .scrollbar-hidden 提供） */
.sidebar-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  min-width: 0;
  overscroll-behavior: contain;
  transition: 
    transform var(--dur-slow) var(--ease-out), 
    opacity var(--dur-slow) ease,
    visibility 0s linear 0s;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.sidebar-scroll-container.collapsed {
  transform: translateX(100%);
  opacity: 0;
  visibility: hidden;
  transition: 
    transform var(--dur-slow) var(--ease-out), 
    opacity var(--dur-slow) ease,
    visibility 0s linear var(--dur-slow);
  pointer-events: none;
}

.sidebar {
  padding: calc(var(--header-height) + var(--space-lg)) 8px calc(var(--footer-height) + var(--space-lg));
}

.sidebar__content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-md);
  color: var(--fg-subtle);
  flex-shrink: 0;
  z-index: 20;
  background: transparent;
}

.footer::before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--footer-height) + 24px);
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(20, 26, 44, 0.16) 50%,
    transparent 100%
  );
  backdrop-filter: blur(14px) saturate(135%);
  -webkit-backdrop-filter: blur(14px) saturate(135%);
  -webkit-mask-image: linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.8) 45%, transparent 100%);
  mask-image: linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.8) 45%, transparent 100%);
}

.footer::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.14) 50%, transparent 95%);
  pointer-events: none;
}

.footer__inner {
  width: min(var(--layout-max), 94%);
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  text-align: center;
  white-space: nowrap;
  text-shadow: var(--text-shadow-on-photo);
}

.footer__link {
  color: var(--fg-muted);
  text-decoration: none;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.35);
  padding: 2px 4px;
  border-radius: var(--radius-xs);
  transition: all var(--dur-base) ease;
}

.footer__link:hover {
  color: var(--fg-strong);
  background: rgba(255, 255, 255, 0.1);
  border-bottom-color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 1200px) {
  .page {
    height: auto;
    min-height: 100dvh;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    position: static;
    overflow: visible;
  }
  
  .content-wrapper.sidebar-hidden,
  .content-wrapper:not(.sidebar-hidden) {
    grid-template-columns: 1fr;
  }
  
  .content-wrapper.sidebar-hidden .main,
  .content-wrapper:not(.sidebar-hidden) .main {
    max-width: none;
  }

  .main-scroll-container {
    overflow: visible;
    height: auto;
    -webkit-overflow-scrolling: auto;
    touch-action: auto;
  }

  .sidebar-scroll-container {
    position: fixed;
    top: calc(var(--header-height) + var(--space-md));
    right: var(--space-md);
    bottom: calc(var(--footer-height) + env(safe-area-inset-bottom) + var(--space-md));
    width: 360px;
    z-index: 9;
    background: rgba(12, 16, 30, 0.85);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    backdrop-filter: var(--blur-xl);
    -webkit-backdrop-filter: var(--blur-xl);
    box-shadow: var(--shadow-float);
    padding: var(--space-md);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior: contain;
  }
  
  .sidebar__content {
    padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
  }
  
  .sidebar-scroll-container .sidebar {
    padding: var(--space-md) 0;
  }
  
  .sidebar-scroll-container.collapsed {
    transform: translateX(calc(100% + 32px));
    pointer-events: none;
  }
}

@media (max-width: 768px) {
  .header__inner { width: 92%; }
  .ctrl-label { display: none; }
  .ctrl-btn { padding: 0 10px; height: 34px; }
  .content-wrapper { width: 92%; }

  .page { 
    --header-height: 70px; 
    --footer-height: 76px; 
  }

  .sidebar-scroll-container {
    top: calc(var(--header-height) + var(--space-sm));
    left: var(--space-sm);
    right: var(--space-sm);
    bottom: calc(var(--footer-height) + env(safe-area-inset-bottom) + var(--space-sm));
    width: auto;
  }
  
  .sidebar-scroll-container.collapsed {
    transform: translateX(calc(100% + 24px));
  }

  .footer__inner {
    width: 92%;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .brand__name { display: none; }
  .brand { padding: var(--space-xs); }
  
  .sidebar-scroll-container {
    left: var(--space-xs);
    right: var(--space-xs);
    bottom: calc(var(--footer-height) + env(safe-area-inset-bottom) + var(--space-xs));
  }
  
  .sidebar-scroll-container.collapsed {
    transform: translateX(calc(100% + 16px));
  }
}
</style>
