<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
  },
  currentTile: {
    type: Boolean,
  },
})

const emit = defineEmits(['pick-tile'])

const tileStyles = computed(() => {
  return {
    tile: true,
    'is-flipped': props.visible,
    current: props.currentTile,
  }
})

const pick = () => {
  emit('pick-tile')
}
</script>

<template>
  <div :class="tileStyles" @click="pick">
    <div v-if="visible" class="tile-face face-up">
      <strong>{{ type }}</strong>
    </div>
    <div v-else class="tile-face face-down">❓</div>
  </div>
</template>

<style scoped>
.current {
  border-color: red;
}
</style>
