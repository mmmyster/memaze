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
</script>

<template>
  <div :class="tileStyles" @click="!visible && pick()">
    <div v-if="visible" class="tile-face face-up">
      <strong>{{ content }}</strong>
      <div class="btn-container" v-if="!answered && !lastTile">
        <button @click.stop="choose(true)">
          <img src="../../public/img/yes_btn.png" alt="yes button" />
        </button>
        <button @click.stop="choose(false)">
          <img src="../../public/img/no_btn.png" alt="no button" />
        </button>
      </div>
    </div>
    <div v-else class="tile-face face-down"></div>
  </div>
</template>

<style scoped>
.current {
  border-color: red;
}

.btn-container {
  display: flex;
  justify-content: space-evenly;
}

button {
  border: none;
  margin: 0;
  padding: 0;
  width: auto;
  overflow: visible;

  background: transparent;

  cursor: pointer;
}

button:hover {
  transform: scale(0.9);
}

button img {
  max-width: 100%;
  width: 38px;
}

.tile.steppable .tile-face {
  background: center / 22% no-repeat url('../../public/img/tile_steppable.png');
}
</style>
