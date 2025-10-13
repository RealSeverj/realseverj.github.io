<template>
  <section class="hero" aria-labelledby="hero-heading">
    <div class="hero__content">
      <div class="hero__badge" v-if="badge">
        <span>{{ badge }}</span>
      </div>
      <h1 id="hero-heading">{{ title }}</h1>
      <p class="hero__tagline">{{ tagline }}</p>
      <p class="hero__intro" v-if="intro">{{ intro }}</p>
      <div class="hero__actions" v-if="actions && actions.length">
        <a
          v-for="action in actions"
          :key="action.label"
          class="hero__action"
          :href="action.href"
          :target="action.external ? '_blank' : '_self'"
          rel="noreferrer"
        >
          <span>{{ action.label }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  tagline: {
    type: String,
    required: true
  },
  intro: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  actions: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  padding: clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem);
  position: relative;
}

.hero__content {
  max-width: 680px;
  color: rgba(243, 246, 255, 0.94);
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.85rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(135, 103, 255, 0.2), rgba(70, 226, 196, 0.2));
  color: rgba(190, 205, 255, 0.88);
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}

h1 {
  font-size: clamp(2.9rem, 7vw, 4.5rem);
  font-weight: 600;
  margin: 0;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.hero__tagline {
  margin: 1.2rem 0 0;
  font-size: clamp(1.2rem, 3.2vw, 1.6rem);
  color: rgba(217, 225, 255, 0.8);
  line-height: 1.6;
}

.hero__intro {
  margin: 1.6rem 0 0;
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  color: rgba(195, 208, 247, 0.75);
  line-height: 1.7;
}

.hero__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 2.4rem;
}

.hero__action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.35rem;
  border-radius: 999px;
  background: linear-gradient(120deg, rgba(129, 103, 255, 0.3), rgba(70, 226, 196, 0.22));
  border: 1px solid rgba(163, 189, 255, 0.25);
  color: rgba(243, 248, 255, 0.94);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;
  position: relative;
  overflow: hidden;
}

.hero__action:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(82, 105, 205, 0.14);
  background: linear-gradient(120deg, rgba(129, 103, 255, 0.45), rgba(70, 226, 196, 0.34));
}

.hero__action:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 4px;
}

@media (max-width: 768px) {
  .hero {
    padding-top: clamp(4rem, 10vh, 6rem);
    justify-content: center;
    text-align: center;
  }

  .hero__content {
    align-items: center;
  }

  .hero__badge {
    margin-left: auto;
    margin-right: auto;
  }

  .hero__actions {
    justify-content: center;
  }
}
</style>
