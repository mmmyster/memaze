<script setup>
import { ref } from 'vue'
import { launchConfetti } from './utilities/confetti'
import Tile from './components/Tile.vue'

const boardLayout = [
  ['start', 'correct', 'wrong', 'wrong'],
  ['wrong', 'correct', 'wrong', 'wrong'],
  ['wrong', 'correct', 'correct', 'wrong'],
  ['wrong', 'wrong', 'correct', 'end'],
]

const rows = boardLayout.length
const cols = boardLayout[0].length

const tileList = ref([])
const currentTile = ref({ row: 0, col: 0 })
const stepsRemaining = ref(0)
const stepsAll = ref(0)

const startGame = () => {
  drawBoard()
  stepsRemaining.value = 0
  currentTile.value = findTileByType('start')
}

const rollDice = () => {
  stepsRemaining.value = Math.floor(Math.random() * 4) + 1
  stepsAll.value += stepsRemaining.value
}

const drawBoard = () => {
  const tempList = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const type = boardLayout[row][col]
      tempList.push({
        position: { row, col },
        type,
        value: `${type}-${row}-${col}`,
        visible: false,
      })
    }
  }

  tileList.value = tempList
}

const findTileByType = (type) => {
  return tileList.value.find((tile) => tile.type === type)?.position || { row: 0, col: 0 }
}

const isAdjacent = (tile) => {
  const currentRow = currentTile.value.row
  const currentCol = currentTile.value.col
  const tileRow = tile.position.row
  const tileCol = tile.position.col

  return (
    (tileRow === currentRow && Math.abs(tileCol - currentCol) === 1) ||
    (tileCol === currentCol && Math.abs(tileRow - currentRow) === 1)
  )
}

const flipTile = (payload) => {
  const index = tileList.value.findIndex(
    (tile) =>
      tile.position.row === payload.position.row && tile.position.col === payload.position.col,
  )

  if (index === -1 || tileList.value[index].visible || stepsRemaining.value <= 0) return

  const tile = tileList.value[index]

  if (!isAdjacent(tile)) return

  tile.visible = true

  if (tile.type === 'correct') {
    currentTile.value = { ...tile.position }
    stepsRemaining.value -= 1
  } else if (tile.type === 'end') {
    currentTile.value = { ...tile.position }
    stepsAll.value -= stepsRemaining.value - 1
    stepsRemaining.value = 0
    launchConfetti()
  } else {
    stepsRemaining.value = 0
  }
}
</script>

<template>
  <main>
    <button @click="startGame">Start Game</button>
    <button @click="rollDice" :disabled="stepsRemaining > 0">🎲 Roll Dice</button>
    <p>Steps left: {{ stepsRemaining }}</p>
    <p>All steps: {{ stepsAll }}</p>

    <section class="board">
      <Tile
        v-for="tile in tileList"
        :key="tile.value"
        :value="tile.value"
        :type="tile.type"
        :visible="tile.visible"
        :current-tile="
          tile.position.row === currentTile.row && tile.position.col === currentTile.col
        "
        @pick-tile="flipTile(tile)"
      />
    </section>
  </main>
</template>

<style scoped></style>
