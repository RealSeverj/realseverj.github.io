<template>
  <div class="weather-time surface">
    <div class="time-display">
      <div class="date-line">
        {{ dateText }}
        <span class="weekday">{{ weekdayText }}</span>
      </div>
      <div class="clock-line">{{ timeText }}</div>
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
    
    <div v-else-if="error" class="weather-error" @click="retryWeather">
      <WeatherIcon name="alert" class="weather-icon weather-icon--alert" />
      <span>{{ error }}</span>
      <span class="retry-hint">(点击重试)</span>
    </div>
  </div>
</template>

<script setup>
import WeatherIcon from './WeatherIcon.vue'
import { useClock } from '../composables/useClock'
import { useWeather } from '../composables/useWeather'

const { dateText, weekdayText, timeText } = useClock()
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
</style>
