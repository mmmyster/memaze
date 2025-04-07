<script setup>
const props = defineProps({
  position: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['pick-card'])

const pickCard = () => {
  emit('pick-card', {
    position: props.position,
  })
}
</script>

<template>
  <div class="card" @click="pickCard">
    <div v-if="visible" class="card-face face-up">
      {{ value }}
    </div>
    <div v-else class="card-face face-down">down</div>
  </div>
</template>

<style>
.card {
  border: 1px solid #000;
  background: rgb(242, 242, 242);
  position: relative;
}

.card-face {
  width: 100%;
  height: 100%;
  position: absolute;
}

.card-face.face-up {
  background: #e64134;
  color: #fff;
}

.card-face.face-down {
  background: #3b9ae1;
  color: #fff;
}
</style>
