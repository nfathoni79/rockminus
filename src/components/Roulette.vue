<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  step: {
    type: Number,
    default: 0,
  },
  bullets: {
    type: Array,
    default: [0, 0, 0, 0, 0, 0],
  },
  bulletShot: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['bulletShot'])

const cylinderClasses = computed(() => {
  if (props.step == 3) {
    return 'animate-spin-fast'
  }

  return 'animate-none'
})

const cylinderStyle = computed(() => {
  if (props.step >= 5 && props.step <= 10) {
    return `transform: rotate(${60 * (props.step - 4)}deg);`
  }

  return 'transform: rotate(0deg);'
})

const bulletClasses = computed(() => {
  const baseClasses = 'transition-colors ease-in-out duration-700'

  return props.bullets.map((bullet, index) => {
    let colorClasses = ''

    if (props.step == 0) {
      colorClasses = 'fill-transparent'
    } else if (props.step == 1) {
      colorClasses = index == 0 ? 'fill-red-800' : 'fill-transparent'
    } else if (props.step >= 2 && props.step <= 4) {
      colorClasses = 'fill-gray-900'
    } else if (props.step >= 5 && props.step <= 10) {
      if (props.bulletShot) {
        colorClasses = bullet == 1 ? 'fill-red-800' : 'fill-transparent'
      } else if (index >= (10 - props.step) && bullet == 1) {
        colorClasses = 'fill-red-800'
      } else if (index >= (10 - props.step) && bullet == 0) {
        colorClasses = 'fill-transparent'
      } else {
        colorClasses = 'fill-gray-900'
      }
    } else {
      colorClasses = 'fill-transparent'
    }

    return `${baseClasses} ${colorClasses}`
  })
})

watch(() => props.step, newStep => {
  if (newStep >= 5 && props.bullets[10 - newStep] == 1) {
    emit('bulletShot')
  }
})
</script>

<template>
  <svg version="1.1" viewBox="0 0 12.457 12.7" xmlns="http://www.w3.org/2000/svg"
    :class="['fill-gray-900 transition', cylinderClasses]"
    :style="cylinderStyle">
    <g>
      <path d="m6.2277 0a6.35 6.35 0 0 0-2.0515 0.34506 1.5141 1.5141 0 0 1-0.19206 0.59235 1.5141 1.5141 0 0 1-1.9227 0.62624 6.35 6.35 0 0 0-2.0598 3.5597 1.5141 1.5141 0 0 1 0.41977 0.45818 1.5141 1.5141 0 0 1-0.42144 1.9862 6.35 6.35 0 0 0 2.0496 3.5584 1.5141 1.5141 0 0 1 0.61238-0.13718 1.5141 1.5141 0 0 1 1.5046 1.3626 6.35 6.35 0 0 0 2.0611 0.34843 6.35 6.35 0 0 0 2.0498-0.34445 1.5141 1.5141 0 0 1 0.18779-0.60315 1.5141 1.5141 0 0 1 1.9343-0.62087 6.35 6.35 0 0 0 2.0552-3.5603 1.5141 1.5141 0 0 1-0.42675-0.463 1.5141 1.5141 0 0 1 0.42941-1.9855 6.35 6.35 0 0 0-2.0531-3.5556 1.5141 1.5141 0 0 1-0.61691 0.13361 1.5141 1.5141 0 0 1-1.5043-1.3585 6.35 6.35 0 0 0-2.0555-0.34224zm-0.078737 1.1949a1.4342 1.4342 0 0 1 1.3189 0.71175 1.4342 1.4342 0 0 1-0.51989 1.9604 1.4342 1.4342 0 0 1-1.9605-0.51989 1.4342 1.4342 0 0 1 0.51994-1.9605 1.4342 1.4342 0 0 1 0.6415-0.19181zm3.2994 1.8594a1.4342 1.4342 0 0 1 1.4378 1.4305 1.4342 1.4342 0 0 1-1.4305 1.4378 1.4342 1.4342 0 0 1-1.4378-1.4305 1.4342 1.4342 0 0 1 1.4305-1.4378zm-6.5237 0.00216a1.4342 1.4342 0 0 1 1.3189 0.7117 1.4342 1.4342 0 0 1-0.51989 1.9604 1.4342 1.4342 0 0 1-1.9605-0.51989 1.4342 1.4342 0 0 1 0.51994-1.9604 1.4342 1.4342 0 0 1 0.6415-0.19181zm3.3009 2.4538a0.8397 0.8397 0 0 1 0.72828 0.41801 0.8397 0.8397 0 0 1-0.30439 1.1478 0.8397 0.8397 0 0 1-1.1478-0.30443 0.8397 0.8397 0 0 1 0.30438-1.1478 0.8397 0.8397 0 0 1 0.41957-0.11358zm-3.2258 1.2671a1.4342 1.4342 0 0 1 1.4378 1.4305 1.4342 1.4342 0 0 1-1.4305 1.4378 1.4342 1.4342 0 0 1-1.4378-1.4305 1.4342 1.4342 0 0 1 1.4305-1.4378zm6.3736 0.00216a1.4342 1.4342 0 0 1 1.3189 0.71175 1.4342 1.4342 0 0 1-0.51994 1.9604 1.4342 1.4342 0 0 1-1.9604-0.5199 1.4342 1.4342 0 0 1 0.51989-1.9605 1.4342 1.4342 0 0 1 0.64155-0.19181zm-3.0742 1.8611a1.4342 1.4342 0 0 1 0.64251 0.18854 1.4342 1.4342 0 0 1 0.52993 1.9578 1.4342 1.4342 0 0 1-1.9577 0.52993 1.4342 1.4342 0 0 1-0.52999-1.9577 1.4342 1.4342 0 0 1 1.3153-0.71853z" />
      <g>
        <circle transform="rotate(-30.147)" cx="4.0661" cy="5.3992" r="1.2105"
          :class="bulletClasses[0]" />
        <circle transform="rotate(89.853)" cx="4.5118" cy="-9.441" r="1.2105"
          :class="bulletClasses[1]" />
        <circle transform="rotate(149.85)" cx="-4.0513" cy="-11.848" r="1.2105"
          :class="bulletClasses[2]" />
        <circle transform="rotate(209.85)" cx="-10.417" cy="-5.6354" r="1.2105"
          :class="bulletClasses[3]" />
        <circle transform="rotate(269.85)" cx="-8.2201" cy="2.9838" r="1.2105"
          :class="bulletClasses[4]" />
        <circle transform="rotate(-30.147)" cx=".343" cy="5.3907" r="1.2105"
          :class="bulletClasses[5]" />
      </g>
    </g>
  </svg>
</template>