<template>
  <div class="article-list-container">
    <div class="article-header">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
      <span>文章列表</span>
      <button @click="toggleMinimize" class="minimize-btn" :title="isMinimized ? '展开' : '收起'">
        <svg v-if="isMinimized" viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M7 14l5-5 5 5z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>
    
    <div v-show="!isMinimized" class="article-body">
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
              <span v-if="article.date" class="article-date">{{ article.date }}</span>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isMinimized = ref(false)
const articles = ref([])

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}

function openArticle(article) {
  if (article.href) {
    // 判断是否为外部链接
    if (/^https?:\/\//i.test(article.href)) {
      window.open(article.href, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = article.href
    }
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/links.json')
    if (response.ok) {
      const data = await response.json()
      // 查找 articles 部分
      const articlesSection = data.sections?.find(s => s.id === 'articles')
      if (articlesSection && articlesSection.links) {
        articles.value = articlesSection.links
      }
    }
  } catch (error) {
    console.error('Failed to load articles:', error)
  }
})
</script>

<style scoped>
.article-list-container {
  border-radius: 16px;
  border: 1px solid rgba(118, 143, 234, 0.2);
  background: rgba(18, 24, 48, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(8, 12, 28, 0.4);
  margin-top: 1rem;
}

.article-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.1rem;
  background: rgba(28, 36, 66, 0.5);
  border-bottom: 1px solid rgba(118, 143, 234, 0.15);
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(226, 234, 255, 0.92);
  cursor: pointer;
  user-select: none;
}

.article-header svg {
  flex-shrink: 0;
}

.article-header span {
  flex: 1;
}

.minimize-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(226, 234, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background 0.2s ease;
  border-radius: 4px;
}

.minimize-btn:hover {
  color: rgba(226, 234, 255, 0.95);
  background: rgba(118, 143, 234, 0.15);
}

.article-body {
  padding: 0.8rem;
}

.articles-scroll {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.articles-scroll::-webkit-scrollbar {
  width: 6px;
}

.articles-scroll::-webkit-scrollbar-track {
  background: rgba(18, 24, 48, 0.3);
  border-radius: 3px;
}

.articles-scroll::-webkit-scrollbar-thumb {
  background: rgba(118, 143, 234, 0.3);
  border-radius: 3px;
}

.articles-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(118, 143, 234, 0.5);
}

.article-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  background: rgba(28, 36, 66, 0.4);
  border: 1px solid rgba(118, 143, 234, 0.15);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.article-item:hover {
  background: rgba(38, 48, 86, 0.55);
  border-color: rgba(118, 143, 234, 0.35);
  box-shadow: 0 2px 12px rgba(8, 12, 28, 0.3);
}

.article-content {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(226, 234, 255, 0.95);
  margin: 0 0 0.3rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-description {
  font-size: 0.82rem;
  color: rgba(180, 195, 230, 0.75);
  margin: 0 0 0.4rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.75rem;
  color: rgba(150, 170, 210, 0.7);
}

.article-date::before {
  content: "📅 ";
  margin-right: 0.2rem;
}

.article-category {
  padding: 0.15rem 0.5rem;
  background: rgba(118, 143, 234, 0.2);
  border-radius: 4px;
  color: rgba(180, 200, 255, 0.85);
}

.article-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(180, 195, 230, 0.6);
  transition: color 0.2s ease, transform 0.2s ease;
}

.article-item:hover .article-arrow {
  color: rgba(118, 143, 234, 0.9);
  transform: translateX(2px);
}

.no-articles {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  color: rgba(180, 195, 230, 0.6);
  text-align: center;
}

.no-articles svg {
  margin-bottom: 0.8rem;
  opacity: 0.5;
}

.no-articles p {
  margin: 0;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-header {
    font-size: 0.88rem;
    padding: 0.8rem 1rem;
  }

  .articles-scroll {
    max-height: 300px;
  }

  .article-item {
    padding: 0.8rem 0.9rem;
  }

  .article-title {
    font-size: 0.9rem;
  }

  .article-description {
    font-size: 0.78rem;
  }
}
</style>
