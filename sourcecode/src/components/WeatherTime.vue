<template>
  <div class="weather-time" :class="ambient ? 'weather-time--ambient' : 'surface'">
    <!-- ambient 沉浸模式：顶部单行 [日期 星期] + [天气模块]，同一行排开，下方是大时钟 -->
    <template v-if="ambient">
      <div class="ambient-header">
        <div class="date-line">
          {{ ambientDate }}
          <span class="weekday">{{ weekdayText }}</span>
        </div>

        <div
          v-if="weather"
          class="ambient-weather"
          :title="`${weather.city} · ${weather.winddirection}风 ${weather.windpower}级 · 湿度 ${weather.humidity}%`"
        >
          <WeatherIcon :name="weatherIconName" class="weather-icon" />
          <span class="weather-text">{{ weather.weather }}</span>
          <span class="temperature">{{ weather.temperature }}°C</span>
          <span class="location" v-if="weather.city">{{ weather.city }}</span>
        </div>
        <div v-else-if="loading" class="ambient-weather ambient-weather--loading">
          <span class="loader-dot"></span>
          <span>天气获取中</span>
        </div>
        <button v-else-if="error" type="button" class="ambient-weather ambient-weather--error" @click="retryWeather">
          <span>重试天气</span>
        </button>
      </div>

      <div class="clock-line" role="timer" aria-live="off" :aria-label="timeText">
        <span class="clock-number" aria-hidden="true">{{ timeText.slice(0, 2) }}</span>
        <span class="clock-separator" aria-hidden="true">
          <span class="clock-dot"></span>
          <span class="clock-dot"></span>
        </span>
        <span class="clock-number" aria-hidden="true">{{ timeText.slice(3, 5) }}</span>
      </div>
    </template>

    <!-- 非 ambient 默认面板模式 -->
    <template v-else>
      <div class="time-display">
        <div class="date-line">
          {{ dateText }}
          <span class="weekday">{{ weekdayText }}</span>
        </div>
        <div class="clock-line" role="timer" aria-live="off" :aria-label="timeText">
          {{ timeText }}
        </div>
      </div>

      <div v-if="weather" class="weather-display">
        <div class="weather-main">
          <WeatherIcon :name="weatherIconName" class="weather-icon" />
          <span class="weather-text">{{ weather.weather }}</span>
          <span class="temperature">{{ weather.temperature }}°C</span>
        </div>
        <div class="weather-details">
          <span class="location">{{ weather.city }}</span>
          <span class="wind">{{ weather.winddirection }}风 {{ weather.windpower }}级</span>
          <span class="humidity">湿度 {{ weather.humidity }}%</span>
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
    </template>
  </div>
</template>

<script setup>
import WeatherIcon from './WeatherIcon.vue'
import { computed } from 'vue'
import { useClock } from '../composables/useClock'
import { useWeather } from '../composables/useWeather'

defineProps({ ambient: { type: Boolean, default: false } })

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

.time-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-line {
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
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
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
  margin-left: auto;
  font-size: 1.35rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.weather-details {
  display: flex;
  gap: var(--space-sm);
  font-size: 0.84rem;
  color: var(--fg-subtle);
}

.location {
  color: var(--fg-muted);
}

.weather-loading,
.weather-error {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 10px 0;
  font-size: 0.9rem;
  color: var(--fg-subtle);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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
  cursor: pointer;
  color: var(--danger);
  transition: color var(--dur-fast) ease;
}

.weather-error:hover {
  color: var(--danger-strong);
}

.retry-hint {
  margin-left: auto;
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
  
  .weather-details {
    flex-wrap: wrap;
  }
}

/* 沉浸模式：同排展示日期天气，纯圆点绝对居中时钟 */
.weather-time--ambient {
  padding: 0;
  min-width: 0;
  color: inherit;
  gap: 10px;
}

.weather-time--ambient .ambient-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.86rem;
  letter-spacing: 0.08em;
  color: inherit;
}

.weather-time--ambient .date-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: inherit;
  letter-spacing: inherit;
  color: inherit;
}

.weather-time--ambient .weekday {
  margin-left: 6px;
  color: inherit;
  opacity: 0.82;
}

.weather-time--ambient .ambient-weather {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-left: 16px;
  border-left: 1px solid rgba(24, 63, 74, 0.28);
  font-size: 0.84rem;
  color: inherit;
}

.weather-time--ambient .weather-icon {
  width: 15px;
  height: 15px;
  color: inherit;
  opacity: 0.9;
}

.weather-time--ambient .weather-text {
  font-weight: 400;
}

.weather-time--ambient .temperature {
  margin-left: 2px;
  font-weight: 500;
  font-size: 0.92rem;
  text-shadow: none;
}

.weather-time--ambient .location {
  font-size: 0.78rem;
  opacity: 0.8;
  margin-left: 2px;
}

.weather-time--ambient .ambient-weather--error,
.weather-time--ambient .ambient-weather--loading {
  background: transparent;
  border: 0;
  border-left: 1px solid rgba(24, 63, 74, 0.28);
  padding: 0 0 0 16px;
  font: inherit;
  font-size: 0.8rem;
  color: inherit;
  cursor: pointer;
}

.weather-time--ambient .ambient-weather--loading {
  cursor: default;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.weather-time--ambient .ambient-weather--loading .loader-dot {
  background: currentColor;
  animation: none;
  width: 5px;
  height: 5px;
}

.weather-time--ambient .clock-line {
  display: inline-flex;
  align-items: center;
  font-family: 'Bodoni MT', Didot, Georgia, 'Times New Roman', serif;
  font-size: clamp(6.5rem, 10vw, 10.5rem);
  font-weight: 400;
  font-variant-numeric: lining-nums tabular-nums;
  line-height: 1;
  letter-spacing: -0.045em;
  color: #163f4d;
  text-shadow: 0 1px 14px rgba(237, 252, 255, 0.2);
  margin-top: 4px;
}

.weather-time--ambient .clock-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.08em;
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
  background-color: currentColor;
  opacity: 0.65;
}

@media (max-width: 768px) {
  .weather-time--ambient .clock-line { font-size: clamp(5rem, 20vw, 7rem); }
  .weather-time--ambient .ambient-header { font-size: 0.8rem; gap: 12px; }
  .weather-time--ambient .ambient-weather { padding-left: 12px; }
}
</style>
