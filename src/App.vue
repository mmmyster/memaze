<script setup>
import _ from 'lodash'
import { computed, ref, watch } from 'vue'
import { launchConfetti } from './utilities/confetti'
import Card from './components/Card.vue'

const cardList = ref([])
const userSelection = ref([])
const newPlayer = ref(true)

const startGame = () => {
  newPlayer.value = false

  restart()
}

const status = computed(() => {
  if (remainingPairs.value === 0) {
    return 'player wins!!!'
  } else {
    return `remaining pairs: ${remainingPairs.value}`
  }
})

const remainingPairs = computed(() => {
  const remainingCards = cardList.value.filter((card) => card.matched === false).length

  return remainingCards / 2
})

const restart = () => {
  cardList.value = _.shuffle(cardList.value)

  cardList.value = cardList.value.map((card, index) => {
    return { ...card, matched: false, position: index, visible: false }
  })
}

const cardItems = [
  'astra',
  'commodore_red',
  'goracy_brew',
  'pale_aged_vodka',
  'potent_pilsner',
  'pyrholidon',
  'speed_bottle',
  'speed_preptide',
]

cardItems.forEach((item) => {
  cardList.value.push({
    matched: false,
    position: null,
    value: item,
    variant: 1,
    visible: false,
  })

  cardList.value.push({
    matched: false,
    position: null,
    value: item,
    variant: 2,
    visible: false,
  })
})

cardList.value = cardList.value.map((card, index) => {
  return {
    ...card,
    position: index,
  }
})

const flipCard = (payload) => {
  cardList.value[payload.position].visible = true

  if (userSelection.value[0]) {
    if (
      (userSelection.value[0].position === payload.position && userSelection.value[0].faceValue) ===
      payload.faceValue
    ) {
      return
    } else {
      userSelection.value[1] = payload
    }
  } else {
    userSelection.value[0] = payload
  }
}

watch(remainingPairs, (currentValue) => {
  if (currentValue === 0) {
    launchConfetti()
  }
})

watch(
  userSelection,
  (currentValue) => {
    if (currentValue.length === 2) {
      const firstCard = currentValue[0]
      const secondCard = currentValue[1]

      if (firstCard.faceValue === secondCard.faceValue) {
        setTimeout(() => {
          cardList.value[firstCard.position].matched = true
          cardList.value[secondCard.position].matched = true
        }, 250)
      } else {
        setTimeout(() => {
          cardList.value[firstCard.position].visible = false
          cardList.value[secondCard.position].visible = false
        }, 250)
      }

      userSelection.value.length = 0
    }
  },
  { deep: true },
)
</script>

<template>
  <h1>Strasaso</h1>

  <transition-group name="card" tag="section" class="board">
    <Card
      v-for="card in cardList"
      :key="`${card.value}-${card.variant}`"
      :matched="card.matched"
      :position="card.position"
      :value="card.value"
      :visible="card.visible"
      @pick-card="flipCard"
    />
  </transition-group>
  <h2>{{ status }}</h2>
  <button v-if="newPlayer" @click="startGame">start</button>
  <button v-else @click="restart">restart</button>
</template>

<style>
#nav {
  display: none;
}
</style>
