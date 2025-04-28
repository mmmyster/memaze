<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['rolled'])

const rotate = ref(false)
const value = ref(2)
const bounce = ref(false)

const roll = () => {
  if (props.disabled || rotate.value) return

  rotate.value = true

  const interval = setInterval(() => {
    value.value = Math.floor(Math.random() * 3) + 2
  }, 100)

  setTimeout(() => {
    clearInterval(interval)
    const finalValue = Math.floor(Math.random() * 3) + 2
    value.value = finalValue
    rotate.value = false
    emit('rolled', finalValue)
  }, 1000)
}

watch(
  () => props.disabled,
  (newDisabled) => {
    if (!newDisabled && !rotate.value) {
      bounce.value = true
    } else {
      bounce.value = false
    }
  },
)

const pips = computed(() => {
  return Array.from({ length: value.value }, (_, i) => i)
})
</script>

<template>
  <div class="face" :class="{ rotate, bounce }" @click="roll">
    <span v-for="(pip, index) in pips" :key="index" class="pip" />
  </div>
</template>

<style scoped>
.face {
  display: grid;
  grid-template-areas:
    'a . c'
    'e g f'
    'd . b';
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);

  flex: 0 0 auto;
  margin: 16px;
  padding: 10px;
  width: 26px;
  height: 26px;

  background-color: #fff;
  border-radius: 8px;
  border: 2px solid black;

  cursor: pointer;
}

.pip {
  display: block;
  align-self: center;
  justify-self: center;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #333;
}

.pip:nth-child(2) {
  grid-area: b;
}
.pip:nth-child(3) {
  grid-area: c;
}
.pip:nth-child(4) {
  grid-area: d;
}
.pip:nth-child(5) {
  grid-area: e;
}
.pip:nth-child(6) {
  grid-area: f;
}
.pip:nth-child(odd):last-child {
  grid-area: g;
}
</style>
