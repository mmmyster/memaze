<script setup>
import { ref } from 'vue'
import Card from './components/Card.vue'

const cardList = ref([])

for (let index = 0; index < 16; index++) {
  cardList.value.push({ position: index, value: index, visible: false })
}

const flipCard = (payload) => {
  cardList.value[payload.position].visible = true
}
</script>

<template>
  <h1>Memaze</h1>

  <section class="board">
    <Card
      v-for="(card, index) in cardList"
      :key="index"
      :position="card.position"
      :value="card.value"
      :visible="card.visible"
      @pick-card="flipCard"
    />
  </section>
</template>

<style>
#nav {
  display: none;
}
</style>
