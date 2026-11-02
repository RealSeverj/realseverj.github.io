<template>
  <div class="weather-time" :class="ambient ? 'weather-time--ambient' : 'surface'">
    <div class="date-weather-line">
      <div class="date-line">
        {{ ambient ? ambientDate : dateText }}
        <span class="weekday">{{ weekdayText }}</span>
      </div>

      <div
        v-if="weather"
        class="weather-display"
        :title="`${weather.city} · ${weather.winddirection}风 ${weather.windpower}级 · 湿度 ${weather.humidity}%`"
      >
        <div class="weather-main">
          <WeatherIcon :name="weatherIconName" class="weather-icon" />
          <span class="weather-text">{{ weather.weather }}</span>
          <span class="temperature">{{ weather.temperature }}°C</span>
        </div>
        <div class="weather-details" v-if="showDetails">
          <span class="location" v-if="weather.city">{{ weather.city }}</span>
          <span class="wind" v-if="weather.winddirection">{{ weather.winddirection }}风 {{ weather.windpower }}级</span>
          <span class="humidity" v-if="weather.humidity !== undefined && weather.humidity !== null">湿度 {{ weather.humidity }}%</span>
        </div>
      </div>

      <div v-else-if="loading" class="weather-loading">
        <span class="loader-dot"></span>
        <span>加载天气中...</span>
      </div>

      <button v-else-if="error" type="button" class="weather-error" @click="retryWeather">
        <WeatherIcon name="alert" class="weather-icon weather-icon--alert" />
        <span>{{ error }}</span>
        <span class="retry-hint">(点击重试)</span>
      </button>
    </div>

    <div class="clock-line" role="timer" aria-live="off" :aria-label="timeText">
      <template v-if="ambient">
        <span class="clock-number" aria-hidden="true">{{ timeText.slice(0, 2) }}</span>
        <span class="clock-separator" aria-hidden="true">
          <span class="clock-dot"></span>
          <span class="clock-dot"></span>
        </span>
        <span class="clock-number" aria-hidden="true">{{ timeText.slice(3, 5) }}</span>
      </template>
      <template v-else>{{ timeText }}</template>
    </div>
  </div>
</template>

<script setup>
import WeatherIcon from './WeatherIcon.vue'
import { computed } from 'vue'
import { useClock } from '../composables/useClock'
import { useWeather } from '../composables/useWeather'

defineProps({
  ambient: { type: Boolean, default: false },
  showDetails: { type: Boolean, default: false }
})

const { now, dateText, weekdayText, timeText } = useClock()
const ambientDate = computed(() => `${now.value.getMonth() + 1} 月 ${String(now.value.getDate()).padStart(2, '0')} 日`)
const { weather, loading, error, weatherIconName, retryWeather } = useWeather()
</script>

<style scoped>
.weather-time {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: 18px 22px;
  color: var(--fg);
  min-width: 280px;
}

.date-weather-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 18px;
}

.date-line {
  display: inline-flex;
  align-items: center;
  font-size: 0.92rem;
  color: var(--fg-muted);
  font-weight: 400;
}

.weekday {
  margin-left: var(--space-xs);
  color: var(--fg-subtle);
}

.clock-line {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.weather-display {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.weather-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.weather-icon {
  color: #ffffff;
  opacity: 0.9;
  flex-shrink: 0;
}

.weather-icon--alert {
  color: var(--danger);
  opacity: 1;
}

.weather-text {
  color: var(--fg);
  font-weight: 500;
}

.temperature {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
}

.weather-details {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.84rem;
  color: var(--fg-subtle);
  flex-wrap: wrap;
}

.location {
  color: var(--fg-muted);
}

.weather-loading,
.weather-error {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.88rem;
  color: var(--fg-subtle);
}

.loader-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

.weather-error {
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  font: inherit;
  cursor: pointer;
  color: var(--danger);
  transition: color var(--dur-fast) ease;
}

.weather-error:hover {
  color: var(--danger-strong);
}

.retry-hint {
  font-size: 0.82rem;
  color: var(--fg-subtle);
}

@media (max-width: 768px) {
  .weather-time {
    min-width: 0;
    width: 100%;
    padding: 16px 18px;
  }
  
  .clock-line {
    font-size: 1.65rem;
  }
}

/* Ambient 沉浸模式：顶部单行 [日期 星期] + [天气完整信息] 同一行排开，下方是大时钟 */
.weather-time--ambient {
  padding: 0;
  min-width: 0;
  color: inherit;
  gap: 16px;
}

.weather-time--ambient .date-weather-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  color: #123644;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

.weather-time--ambient .date-line {
  font-size: 0.86rem;
  letter-spacing: 0.12em;
  color: inherit;
}

.weather-time--ambient .weekday {
  color: inherit;
  opacity: 0.85;
  margin-left: 18px;
  padding-left: 18px;
  border-left: 1px solid rgba(24, 63, 74, 0.3);
}

.weather-time--ambient .weather-display {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 0 0 0 18px;
  margin-left: 18px;
  border: 0;
  border-left: 1px solid rgba(24, 63, 74, 0.3);
}

.weather-time--ambient .weather-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
}

.weather-time--ambient .weather-icon,
.weather-time--ambient .weather-text,
.weather-time--ambient .temperature {
  color: inherit;
}

.weather-time--ambient .temperature {
  margin-left: 2px;
  font-size: 0.95rem;
  font-weight: 400;
  text-shadow: none;
}

.weather-time--ambient .weather-details {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  color: inherit;
  opacity: 0.85;
}

.weather-time--ambient .location,
.weather-time--ambient .wind,
.weather-time--ambient .humidity,
.weather-time--ambient .retry-hint {
  color: inherit;
}

.weather-time--ambient .weather-loading,
.weather-time--ambient .weather-error {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 0 0 18px;
  margin-left: 18px;
  border: 0;
  border-left: 1px solid rgba(24, 63, 74, 0.3);
  font-size: 0.8rem;
  color: inherit;
}

.weather-time--ambient .loader-dot {
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.weather-time--ambient .clock-line {
  display: inline-flex;
  align-items: center;
  font-family: 'Bodoni MT', Didot, Georgia, 'Times New Roman', serif;
  font-size: clamp(6.5rem, 10.5vw, 11rem);
  font-weight: 300;
  font-variant-numeric: lining-nums tabular-nums;
  line-height: 1;
  letter-spacing: -0.04em;
  color: rgba(232, 248, 255, 0.22);
  -webkit-text-stroke: 1.3px rgba(255, 255, 255, 0.78);
  text-shadow:
    -1.5px -1.5px 1px rgb(255, 255, 255, 0.64),
    1.5px -1.5px 1px rgba(255, 255, 255, 0.3),
    0 0 28px rgba(215, 245, 255, 0.2);

  user-select: none;
}

.weather-time--ambient .clock-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.06em;
  text-align: center;
}

.weather-time--ambient .clock-separator {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.26em;
  margin: 0 0.16em;
  align-self: center;
  transform: translateY(-0.03em);
}

.weather-time--ambient .clock-dot {
  width: 0.08em;
  height: 0.08em;
  border-radius: 50%;
  background-color: rgba(232, 248, 255, 0.26);
  border: 1.3px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    -1px -1px 1px rgba(255, 255, 255, 0.95),
    0 0 16px rgba(215, 245, 255, 0.5),
    0 4px 10px rgba(8, 28, 38, 0.3);
}

@media (max-width: 768px) {
  .weather-time--ambient .clock-line {
    font-size: clamp(5rem, 20vw, 7rem);
  }
  .weather-time--ambient .date-line {
    font-size: 0.8rem;
    letter-spacing: 0.03em;
  }
  .weather-time--ambient .date-weather-line {
    gap: 8px 14px;
  }
  .weather-time--ambient .weekday,
  .weather-time--ambient .weather-display,
  .weather-time--ambient .weather-loading,
  .weather-time--ambient .weather-error {
    margin-left: 10px;
    padding-left: 10px;
  }
}
</style>
