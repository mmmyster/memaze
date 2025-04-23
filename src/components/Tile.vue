<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  answer: {
    type: Boolean,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  answered: {
    type: Boolean,
    default: false,
  },
  currentTile: {
    type: Boolean,
    required: true,
  },
  lastTile: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['pick-tile', 'answer'])

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

const choose = (confirm) => {
  emit('answer', confirm)
}
</script>

<template>
  <div :class="tileStyles" @click="!visible && pick()">
    <div v-if="visible" class="tile-face face-up">
      <strong>{{ content }}</strong>
      <div v-if="!answered && !lastTile">
        <button @click.stop="choose(true)">✅</button>
        <button @click.stop="choose(false)">❌</button>
      </div>
    </div>
    <div v-else class="tile-face face-down">❓</div>
  </div>
</template>

<style scoped>
.current {
  border-color: red;
}

button {
  margin: 2px;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
}
</style>
