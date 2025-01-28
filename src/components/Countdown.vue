<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  time: {
    type: Number,
    default: 10,
  },
  starting: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'black',
  },
})

const emit = defineEmits(['timeUp'])

const currentTime = ref(props.time)
const countdownInterval = ref(null)
const starting = ref(false)

const strokeDasharray = computed(() => {
  if (currentTime.value >= props.time && !starting.value) {
    return '283 283'
  }

  let dasharray = ((currentTime.value - 1) / props.time * 283).toFixed(0)
  if (dasharray < 0) dasharray = 0

  return `${dasharray} 283`
})

const transitionClasses = computed(() => {
  return starting.value
    ? 'transition-all ease-linear duration-1000'
    : 'transition-none'
})

const colorClasses = computed(() => {
  return props.color == 'red'
    ? 'stroke-red-800'
    : 'stroke-gray-900'
})

watch(currentTime, newTime => {
  if (newTime <= 0) {
    starting.value = false
    clearInterval(countdownInterval.value)
    emit('timeUp')
  }
})

watch(() => props.starting, newStarting => {
  if (newStarting) {
    starting.value = true
    startCountdown()
  } else {
    currentTime.value = props.time
  }
})

onMounted(() => {
  if (props.starting) {
    setTimeout(() => {
      starting.value = true
      startCountdown()
    }, 50)
  }
})

const startCountdown = () => {
  countdownInterval.value = setInterval(() => {
    currentTime.value--
  }, 1000)
}
</script>

<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="fill-none stroke-none">
      <circle cx="50" cy="50" r="45"
        stroke-linecap="round"
        :stroke-dasharray="strokeDasharray"
        :class="['stroke-2 -rotate-90 origin-center',
        transitionClasses, colorClasses]" />
    </g>
  </svg>
</template>