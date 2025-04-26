<script setup>
import { computed, onMounted, ref } from 'vue'
import { data } from '@/data'
import { launchConfetti } from '@/utilities/confetti'
import Tile from '@/components/Tile.vue'
import Dice from '@/components/Dice.vue'

const question = ref(data.question)
const tiles = ref([])
const currentTile = ref(null)
const firstTile = ref(null)
const boardSize = ref(0)

const currentTilePos = ref(null)
const lastTilePos = ref(null)

const diceRef = ref(null)
const dialogRef = ref(null)
const hint = ref('')

const stepsRemaining = ref(0)
const stepsAll = ref(0)

const freezeTiles = ref(false)
const answeredWrong = ref(false)

onMounted(() => {
  startGame()
})

const startGame = () => {
  drawBoard()
  stepsRemaining.value = 0

  if (firstTile.value) {
    setTimeout(() => {
      currentTile.value = firstTile.value.id
      firstTile.value.visible = true
      updatePlayerPos(currentTile.value)
    }, 100)
  }
}

const onDiceRolled = (value) => {
  stepsRemaining.value = value
  stepsAll.value += value
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
      answered: false,
      firstTile: id === 0,
      lastTile: id === totalTiles - 1,
    })

    if (tempList[0].firstTile) {
      firstTile.value = tempList[0]
    }

    if (tempList[tempList.length - 1].lastTile) {
      lastTilePos.value = tempList[tempList.length - 1]
    }
  }

  tiles.value = tempList

  setFinishPos()
}

// SPRITES POSITIONS
const updatePlayerPos = (tileId) => {
  const tile = tiles.value[tileId]
  const row = Math.floor(tile.id / boardSize.value)
  const col = tile.id % boardSize.value
  currentTilePos.value = { top: row * 100, left: col * 100 }
}

const setFinishPos = () => {
  const row = Math.floor(lastTilePos.value.id / boardSize.value)
  const col = lastTilePos.value.id % boardSize.value
  lastTilePos.value = { top: row * 100, left: col * 100 }
}

const playerPos = computed(() => ({
  top: `${currentTilePos.value?.top - 33}px`,
  left: `${currentTilePos.value?.left - 20}px`,
}))

const kitePos = computed(() => ({
  top: `${lastTilePos.value?.top + 70}px`,
  left: `${lastTilePos.value?.left + 90}px`,
}))

// NEIGHBOR TILES
const isNeighbor = (tile) => {
  const currentRow = Math.floor(currentTile.value / boardSize.value)
  const currentCol = currentTile.value % boardSize.value
  const tileRow = Math.floor(tile.id / boardSize.value)
  const tileCol = tile.id % boardSize.value

  return (
    (tileRow === currentRow && Math.abs(tileCol - currentCol) === 1) ||
    (tileCol === currentCol && Math.abs(tileRow - currentRow) === 1)
  )
}

const isSteppable = (tile) => {
  return (
    !tile.visible &&
    !tile.answered &&
    isNeighbor(tile) &&
    stepsRemaining.value > 0 &&
    !freezeTiles.value &&
    !answeredWrong.value
  )
}

const flipTile = (payload) => {
  const tile = tiles.value.find((tile) => tile.id === payload.id)

  if (!tile) return

  if (tile.visible || stepsRemaining.value <= 0 || freezeTiles.value) {
    if (stepsRemaining.value <= 0 && diceRef.value && firstTile.value?.answered) {
      diceRef.value.triggerShake()
      hint.value = 'Pomôcka: Musíš hodiť kockou a číslo, ktoré ti padne je počet ťahov.'
    }
    return
  }

  if (!isNeighbor(tile)) {
    hint.value = 'Pomôcka: Odhaliť môžeš len susedné kartičky.'
    return
  }

  tile.visible = true
  freezeTiles.value = true
  hint.value = ''

  updatePlayerPos(tile.id)

  if (tile.lastTile) {
    currentTile.value = tile.id
    stepsAll.value -= stepsRemaining.value - 1
    stepsRemaining.value = 0
    launchConfetti()
    showDialog()
  } else {
    stepsRemaining.value--
  }
}

// DIALOG
const showDialog = () => {
  const dialog = dialogRef.value
  if (dialog) {
    dialog.showModal()
  }
}

const closeDialog = () => {
  const dialog = dialogRef.value
  if (dialog) {
    dialog.close()
  }
}

const handleAnswer = (confirm, tile) => {
  if (tile.answered) return

  if (confirm && tile.answer) {
    currentTile.value = tile.id
    updatePlayerPos(tile.id)
    tile.answered = true
  } else if (!confirm && !tile.answer) {
    tile.visible = false
  } else {
    answeredWrong.value = true
    setTimeout(() => {
      answeredWrong.value = false
      if (firstTile.value?.answered) {
        stepsRemaining.value = 0
        tile.visible = false
      }
    }, 1000)
  }

  freezeTiles.value = false
}
</script>

<template>
  <header>
    <p>
      Zostáva ti <b>{{ stepsRemaining }}</b> krokov.
    </p>

    <Dice
      ref="diceRef"
      :disabled="!firstTile?.answered || stepsRemaining > 0"
      @rolled="onDiceRolled"
    />
  </header>
  <main>
    <h2>{{ question }}</h2>

    <section class="board">
      <div v-if="currentTilePos" :style="playerPos" class="player ellipse"></div>

      <div v-if="lastTilePos" :style="kitePos" class="kite shakeY"></div>

      <Tile
        v-for="tile in tiles"
        :id="tile.id"
        :key="tile.id"
        :answer="tile.answer"
        :content="tile.content"
        :visible="tile.visible"
        :answered="tile.answered"
        :steppable="isSteppable(tile)"
        :current-tile="tile.id === currentTile"
        :last-tile="tile.lastTile"
        :class="{
          zoomIn: !tile.answered && tile.visible,
          shakeX: tile.visible && !tile.answered && answeredWrong,
          zoomOut: tile.answered && tile.answer,
        }"
        @pick-tile="flipTile(tile)"
        @answer="(confirm) => handleAnswer(confirm, tile)"
      />
    </section>

    <dialog ref="dialogRef" @click="closeDialog">
      Hru si zvládol dohrať za {{ stepsAll }} krokov!
    </dialog>
  </main>

  <footer>
    <button @click="startGame">Hrať znovu</button>

    <div class="hint">{{ hint }}</div>
  </footer>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-evenly;
  align-items: end;
}

.player,
.kite {
  position: absolute;
  z-index: 10;
}

.player {
  width: 80px;
  height: 50px;
  background: url('/img/player.png');
  background-size: cover;
  transition:
    top 0.6s ease,
    left 0.6s ease;
}

.kite {
  width: 35px;
  height: 85px;
  background: url('/img/kite.png');
  background-size: cover;
}

button {
  background: #ffaaac;
  padding-right: 10px;
  padding-left: 10px;
  min-height: 28px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  align-self: start;
}

.hint {
  max-width: 20rem;
  min-height: 60px;

  padding-top: 11.1px;
  text-align: center;
}

dialog {
  border: none;
  outline: none;

  margin-bottom: auto;
  min-width: auto;

  border-radius: 5px;
  background: #141620;
  color: rgb(236, 236, 236);
  font-weight: bold;
  font-size: 28px;
  line-height: 28px;
}
</style>
