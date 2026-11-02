<template>
  <div class="article-list-container surface">
    <div class="article-header" @click="toggleMinimize">
      <svg class="header-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
      <span>文章列表</span>
      <button 
        @click.stop="toggleMinimize" 
        class="minimize-btn" 
        :class="{ 'is-rotated': isMinimized }"
        :title="isMinimized ? '展开' : '收起'"
        type="button"
        aria-label="切换文章列表折叠状态"
      >
        <svg class="chevron-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>
    
    <!-- 丝滑折叠外层（CSS Grid 0fr <-> 1fr 硬件加速） -->
    <div class="collapse-wrapper" :class="{ 'is-collapsed': isMinimized }">
      <div class="collapse-inner">
        <div class="article-body">
          <!-- 文章列表 -->
          <div v-if="articles.length > 0" class="articles-scroll">
            <div 
              v-for="(article, index) in articles" 
              :key="index"
              class="article-item"
              @click="openArticle(article)"
            >
              <div class="article-content">
                <h3 class="article-title">{{ article.title }}</h3>
                <p v-if="article.description" class="article-description">{{ article.description }}</p>
                <div class="article-meta">
                  <span v-if="article.date" class="article-date">
                    <svg class="meta-icon" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                      <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    </svg>
                    {{ article.date }}
                  </span>
                  <span v-if="article.category" class="article-category">{{ article.category }}</span>
                </div>
              </div>
              <div class="article-arrow">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div v-else class="no-articles">
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <p>暂无文章</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { findSection, isExternalUrl } from '../lib/links.js'
import { loadLinks } from '../services/links.js'

const isMinimized = ref(false)
const articles = ref([])

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}

function openArticle(article) {
  if (article.href) {
    if (isExternalUrl(article.href)) {
      window.open(article.href, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = article.href
    }
  }
}

onMounted(async () => {
  try {
    const sections = await loadLinks()
    const articlesSection = findSection(sections, 'articles')
    if (articlesSection?.links) {
      articles.value = articlesSection.links
    }
  } catch (error) {
    console.error('Failed to load articles:', error)
  }
})
</script>

<style scoped>
.article-list-container {
  overflow: hidden;
  transition: border-radius var(--dur-base) ease;
}

.article-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 12px 16px;
  background: var(--surface-header);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--fg);
  cursor: pointer;
  user-select: none;
  transition: background var(--dur-fast) ease;
}

.article-header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.header-icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.article-header span {
  flex: 1;
  letter-spacing: 0.01em;
}

.minimize-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--fg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  transition: color var(--dur-base) ease, background var(--dur-base) ease;
}

.minimize-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
}

.chevron-icon {
  display: block;
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.minimize-btn.is-rotated .chevron-icon {
  transform: rotate(-180deg);
}

/* 现代丝滑折叠器容器：0fr <-> 1fr 动画 */
.collapse-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 340ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease;
  opacity: 1;
}

.collapse-wrapper.is-collapsed {
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
}

.collapse-inner {
  min-height: 0;
  overflow: hidden;
}

.article-body {
  padding: 12px;
}

.articles-scroll {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
}

.articles-scroll::-webkit-scrollbar {
  width: 4px;
}

.articles-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.articles-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.articles-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 
 * 关键修正：彻底移除整卡 translateX 位移，
 * 采用光学提亮与边缘内发光，卡片自身严丝合缝不破框
 */
.article-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: background var(--dur-base) ease, border-color var(--dur-base) ease, box-shadow var(--dur-base) ease;
}

.article-item:hover {
  background: rgba(255, 255, 255, 0.085);
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.article-content {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 0.94rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.3rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-description {
  font-size: 0.82rem;
  color: var(--fg-muted);
  margin: 0 0 0.45rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.45;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.76rem;
  color: var(--fg-subtle);
}

.article-date {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.meta-icon {
  opacity: 0.65;
}

.article-category {
  padding: 0.12rem 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-pill);
  color: var(--fg-muted);
  font-size: 0.72rem;
}

/* 仅右侧指引箭头有轻微的 3px 微滑动，灵动且不影响外框容器 */
.article-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-subtle);
  transition: color var(--dur-fast) ease, transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.article-item:hover .article-arrow {
  color: #ffffff;
  transform: translateX(3px);
}

.no-articles {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  color: var(--fg-subtle);
  text-align: center;
}

.no-articles svg {
  margin-bottom: 0.8rem;
  opacity: 0.4;
}

.no-articles p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .article-header {
    font-size: 0.88rem;
    padding: 10px 14px;
  }

  .articles-scroll {
    max-height: 300px;
  }

  .article-item {
    padding: 10px 12px;
  }

  .article-title {
    font-size: 0.9rem;
  }

  .article-description {
    font-size: 0.78rem;
  }
}
</style>
