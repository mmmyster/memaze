<script setup>
import { ref } from 'vue'
import { data } from '@/data'
import { launchConfetti } from '@/utilities/confetti'
import Tile from '@/components/Tile.vue'

const question = ref(data.question)
const tiles = ref([])
const currentTile = ref(null)
const boardSize = ref(0)

const stepsRemaining = ref(0)
const stepsAll = ref(0)

const freezeTiles = ref(false)

const startGame = () => {
  drawBoard()
  stepsRemaining.value = 0
  currentTile.value = tiles.value[0]?.id
}

const rollDice = () => {
  stepsRemaining.value = Math.floor(Math.random() * 4) + 2
  stepsAll.value += stepsRemaining.value
}

const drawBoard = () => {
  const totalTiles = data.tiles.length
  const size = Math.sqrt(totalTiles)

  if (!Number.isInteger(size)) {
    console.error('must be a perfect square')
    return
  }

  boardSize.value = size

  const tempList = []

  for (let id = 0; id < totalTiles; id++) {
    const tileData = data.tiles[id]

    tempList.push({
      id,
      answer: tileData?.answer || false,
      content: tileData?.content || '',
      visible: false,
      firstTile: id === 0,
      lastTile: id === totalTiles - 1,
    })
  }

  tiles.value = tempList
}

const isAdjacent = (tile) => {
  const currentRow = Math.floor(currentTile.value / boardSize.value)
  const currentCol = currentTile.value % boardSize.value
  const tileRow = Math.floor(tile.id / boardSize.value)
  const tileCol = tile.id % boardSize.value

  return (
    (tileRow === currentRow && Math.abs(tileCol - currentCol) === 1) ||
    (tileCol === currentCol && Math.abs(tileRow - currentRow) === 1)
  )
}

const flipTile = (payload) => {
  const tile = tiles.value.find((tile) => tile.id === payload.id)

  if (!tile || tile.visible || stepsRemaining.value <= 0 || freezeTiles.value) return

  if (!isAdjacent(tile)) return

  tile.visible = true
  freezeTiles.value = true

  if (tile.lastTile) {
    currentTile.value = tile.id
    stepsAll.value -= stepsRemaining.value - 1
    stepsRemaining.value = 0
    launchConfetti()
  } else {
    stepsRemaining.value--
  }
}

const handleAnswer = (confirm, tile) => {
  if (confirm && tile.answer) {
    currentTile.value = tile.id
  } else if (!confirm && !tile.answer) {
    tile.visible = false
  } else {
    stepsRemaining.value = 0
    tile.visible = false
  }

  freezeTiles.value = false
}
</script>

<template>
  <main>
    <button @click="startGame">Start Game</button>
    <button @click="rollDice" :disabled="stepsRemaining > 0">🎲 Roll Dice</button>
    <p>Steps left: {{ stepsRemaining }}</p>
    <p>All steps: {{ stepsAll }}</p>
    <h2>{{ question }}</h2>

    <section class="board">
      <Tile
        v-for="tile in tiles"
        :id="tile.id"
        :key="tile.id"
        :answer="tile.answer"
        :content="tile.content"
        :visible="tile.visible"
        :current-tile="tile.id === currentTile"
        :last-tile="tile.lastTile"
        @pick-tile="flipTile(tile)"
        @answer="(confirm) => handleAnswer(confirm, tile)"
      />
    </section>
  </main>
</template>

<style scoped></style>
