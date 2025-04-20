<script setup>
import { computed } from 'vue'

const props = defineProps({
  matched: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['pick-card'])

const flippedStyles = computed(() => {
  if (props.visible && !props.matched) {
    return 'is-flipped'
  }

  if (props.matched) {
    return 'is-matched'
  }
  return null
})

const pickCard = () => {
  emit('pick-card', {
    position: props.position,
    faceValue: props.value,
  })
}
</script>

<template>
  <div class="card" :class="flippedStyles" @click="pickCard">
    <div class="card-face face-up">
      <img :src="`./img/${value}.webp`" :alt="`${value}`" />
    </div>
    <div class="card-face face-down"></div>
  </div>
</template>

<style></style>
