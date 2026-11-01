<script setup>
defineProps({
  name: { type: String, default: 'cloud' }
})
</script>

<template>
  <svg
    class="weather-icon"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'sun'">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.2v2.1M12 19.7v2.1M2.2 12h2.1M19.7 12h2.1M5.1 5.1l1.5 1.5M17.4 17.4l1.5 1.5M5.1 18.9l1.5-1.5M17.4 6.6l1.5-1.5" />
    </template>

    <template v-else-if="name === 'cloud-sun'">
      <path d="M8 2.8v1.6M2.8 8h1.6M4.4 4.4l1.1 1.1M11.6 4.4l-1.1 1.1" />
      <circle cx="8" cy="8" r="2.5" />
      <path d="M9.5 20h8.2a3.3 3.3 0 0 0 .4-6.6 5 5 0 0 0-9.6-1.3A3.1 3.1 0 0 0 9.5 20Z" />
    </template>

    <template v-else-if="name === 'rain'">
      <path d="M7.3 15.5h9.4a3.6 3.6 0 0 0 .4-7.2 5.4 5.4 0 0 0-10.4-1.1 3.4 3.4 0 0 0 .6 8.3Z" />
      <path d="M8.6 18.6l-1 2.4M12.6 18.6l-1 2.4M16.6 18.6l-1 2.4" />
    </template>

    <template v-else-if="name === 'snow'">
      <path d="M7.3 15.5h9.4a3.6 3.6 0 0 0 .4-7.2 5.4 5.4 0 0 0-10.4-1.1 3.4 3.4 0 0 0 .6 8.3Z" />
      <path d="M8.2 19.2h.01M12 19.2h.01M15.8 19.2h.01M10.1 21.4h.01M13.9 21.4h.01" />
    </template>

    <template v-else-if="name === 'fog'">
      <path d="M4 8.5h7.5M15 8.5h5M3 12.5h9.5M16.5 12.5h4.5M5 16.5h8M16.5 16.5h2.5" />
    </template>

    <template v-else-if="name === 'thunder'">
      <path d="M7.3 15.5h9.4a3.6 3.6 0 0 0 .4-7.2 5.4 5.4 0 0 0-10.4-1.1 3.4 3.4 0 0 0 .6 8.3Z" />
      <path d="M13.2 17.2L10.6 21h3l-1.4 2.4" />
    </template>

    <template v-else-if="name === 'alert'">
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.8v4.8M12 16.2h.01" />
    </template>

    <template v-else>
      <path d="M7.3 17h9.4a3.6 3.6 0 0 0 .4-7.2 5.4 5.4 0 0 0-10.4-1.1A3.4 3.4 0 0 0 7.3 17Z" />
    </template>
  </svg>
</template>
