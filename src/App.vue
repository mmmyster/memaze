<script setup>
import Card from './components/Card.vue'

const cardList = []

for (let index = 0; index < 16; index++) {
  cardList.push(index)
}
</script>

<template>
  <h1>Memaze</h1>

  <section class="board">
    <Card v-for="(card, index) in cardList" :key="`card-${index}`" :value="card" />
  </section>
</template>

<style>
#nav {
  display: none;
}
</style>
