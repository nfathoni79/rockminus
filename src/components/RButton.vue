<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'black',
  },
})

const colorClasses = computed(() => {
  if (props.color == 'red') {
    return 'border-red-800 bg-transparent hover:bg-red-800 text-red-800 hover:text-red-50'
  }

  return 'border-gray-900 bg-transparent hover:bg-gray-900 text-gray-900 hover:text-white'
})
</script>

<template>
  <button :class="['block border-4 rounded-full px-8 py-2',
    'text-2xl font-semibold uppercase', colorClasses]">
    <slot></slot>
  </button>
</template>