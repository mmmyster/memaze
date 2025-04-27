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
  steppable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['pick-tile', 'answer'])

const tileStyles = computed(() => {
  return {
    tile: true,
    'is-flipped': props.visible,
    current: props.currentTile,
    last: props.lastTile,
    answered: props.answered,
    steppable: props.steppable,
  }
})

const pick = () => {
  emit('pick-tile')
}

const choose = (confirm) => {
  emit('answer', confirm)
}

const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(url)
}

const fullImagePath = (path) => {
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}
</script>

<template>
  <div :class="tileStyles" @click="!visible && pick()">
    <div v-if="visible" class="tile-face face-up">
      <img v-if="isImage(content)" :src="fullImagePath(content)" alt="" />
      <div v-else>{{ content }}</div>
      <div class="btn-container" v-if="!answered && !lastTile">
        <button @click.stop="choose(true)" class="zoomOutButton">
          <img src="/img/yes_btn.png" alt="yes button" />
        </button>
        <button @click.stop="choose(false)" class="zoomOutButton">
          <img src="/img/no_btn.png" alt="no button" />
        </button>
      </div>
    </div>
    <div v-else class="tile-face face-down"></div>
  </div>
</template>

<style scoped>
.tile-face > img {
  width: auto;
  height: auto;
}

.btn-container {
  display: flex;
  justify-content: space-evenly;
  position: absolute;
  bottom: 0;
}

.btn-container button {
  border: none;
  margin: 0;
  padding: 0;
  width: auto;
  overflow: visible;

  background: transparent;

  cursor: pointer;
}

button img {
  max-width: 38px;
  width: 100%;
}
</style>
