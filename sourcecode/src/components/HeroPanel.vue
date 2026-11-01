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
  color: var(--fg-strong);
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.95rem;
  margin-bottom: 1.2rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--fg);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: var(--blur-sm);
  -webkit-backdrop-filter: var(--blur-sm);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

h1 {
  font-size: clamp(2.9rem, 7vw, 4.6rem);
  font-weight: 600;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: #ffffff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
}

.hero__tagline {
  margin: 1.2rem 0 0;
  font-size: clamp(1.2rem, 3.2vw, 1.6rem);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.hero__intro {
  margin: 1.4rem 0 0;
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  color: var(--fg-muted);
  line-height: 1.7;
}

.hero__actions {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-top: 2.2rem;
}

.hero__action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: none;
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: transform var(--dur-base) ease, box-shadow var(--dur-base) ease, background var(--dur-base) ease, border-color var(--dur-base) ease;
  position: relative;
  overflow: hidden;
}

.hero__action:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.hero__action:focus-visible {
  outline: 2px solid var(--focus-ring);
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
