<template>
  <div class="article-feed">
    <a
      v-for="article in articles"
      :key="article.href"
      class="article-row"
      :href="article.href"
      :target="isExternalUrl(article.href) ? '_blank' : '_self'"
      rel="noreferrer noopener"
    >
      <div class="article-row__cover" aria-hidden="true">
        <img
          v-if="article.image"
          :src="resolveLinkImage(article.image)"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="article-row__body">
        <div class="article-row__meta">
          <span v-if="article.category" class="article-row__category">{{ article.category }}</span>
          <time v-if="article.date" class="article-row__date" :datetime="normalizeDate(article.date)">
            {{ formatDate(article.date) }}
          </time>
        </div>
        <h3 class="article-row__title">{{ article.title }}</h3>
        <p v-if="article.description" class="article-row__desc">{{ article.description }}</p>
      </div>
    </a>
  </div>
</template>

<script setup>
import { isExternalUrl, resolveLinkImage } from '../lib/links.js'

defineProps({
  articles: { type: Array, default: () => [] }
})

// 数据里的日期写法不统一（如 2024-3-14），展示与 datetime 属性统一补零
function normalizeDate(value = '') {
  return String(value)
    .split('-')
    .map((part, index) => (index === 0 ? part : part.padStart(2, '0')))
    .join('-')
}

function formatDate(value) {
  return normalizeDate(value).replaceAll('-', '.')
}
</script>

<style scoped>
.article-feed {
  display: flex;
  flex-direction: column;
  gap: clamp(0.9rem, 2.5vw, 1.25rem);
}

.article-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
  gap: clamp(1rem, 2.4vw, 1.6rem);
  align-items: center;
  padding: 10px;
  border-radius: var(--radius-xl);
  color: var(--fg);
  text-decoration: none;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  overflow: hidden;
  transition: transform var(--dur-base) ease, border-color var(--dur-base) ease, background var(--dur-base) ease;
}

.article-row::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: radial-gradient(240px 240px at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.1), transparent 70%);
  opacity: 0;
  transition: opacity 250ms ease;
  pointer-events: none;
  border-radius: inherit;
}

.article-row:hover::before {
  opacity: 1;
}

.article-row:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  background: var(--card-bg-hover);
}

.article-row__cover {
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
}

.article-row__cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
  transition: transform 700ms var(--ease-out);
}

.article-row:hover .article-row__cover img {
  transform: scale(1.045);
}

.article-row__body {
  min-width: 0;
  padding: 4px clamp(0.4rem, 1.6vw, 1rem) 4px 0;
}

.article-row__meta {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.55rem;
  color: var(--fg-subtle);
  font-size: 0.8rem;
  line-height: 1;
}

/* 与分区眉标同一套衬线斜体语言 */
.article-row__category {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  font-style: italic;
  letter-spacing: 0.06em;
  color: var(--fg-muted);
}

.article-row__date {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.article-row__date::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 3px;
  margin-right: 0.7rem;
  vertical-align: middle;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.article-row__title {
  margin: 0 0 0.55rem;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0.03em;
  color: #ffffff;
}

.article-row__desc {
  margin: 0;
  color: var(--fg-muted);
  font-size: 0.9rem;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 640px) {
  .article-row {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .article-row__cover {
    aspect-ratio: 16 / 9;
  }

  .article-row__body {
    padding: 0 6px 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-row,
  .article-row__cover img {
    transition: none;
  }

  .article-row:hover,
  .article-row:hover .article-row__cover img {
    transform: none;
  }
}
</style>

