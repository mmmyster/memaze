<script setup>
import { computed, onMounted, ref } from 'vue'
import renaissanceData from '@/renaissance'
import spaceData from '@/space'
import { launchConfetti } from '@/utilities/confetti'
import Tile from '@/components/Tile.vue'
import Dice from '@/components/Dice.vue'

const data = ref(renaissanceData)
const question = computed(() => data.value.question)
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

const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

onMounted(() => {
  startGame()
  window.addEventListener('resize', handleWindowSizeChange)
})

const handleWindowSizeChange = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const startGame = () => {
  drawBoard()
  stepsRemaining.value = 0
  stepsAll.value = 0

  if (firstTile.value) {
    setTimeout(() => {
      currentTile.value = firstTile.value.id
      firstTile.value.visible = true
      updatePlayerPos(currentTile.value)
    }, 100)
  }
}

const switchData = (type) => {
  data.value = type === 'renaissance' ? renaissanceData : spaceData
  startGame()
}

const onDiceRolled = (value) => {
  stepsRemaining.value = value
  stepsAll.value += value
}

const tileSize = computed(() => {
  const maxBoardWidth = windowWidth.value * 0.8
  const maxBoardHeight = windowHeight.value * 0.6

  const sizeByWidth = maxBoardWidth / boardSize.value
  const sizeByHeight = maxBoardHeight / boardSize.value

  const sizePerTile = Math.min(sizeByWidth, sizeByHeight)

  return Math.min(Math.max(sizePerTile, 60), 120)
})

const drawBoard = () => {
  const totalTiles = data.value.tiles.length
  const size = Math.sqrt(totalTiles)

  if (!Number.isInteger(size)) {
    console.error('must be a perfect square')
    return
  }

  boardSize.value = size

  const tempList = []

  for (let id = 0; id < totalTiles; id++) {
    const tileData = data.value.tiles[id]

    tempList.push({
      id,
      answer: tileData?.answer || false,
      image: tileData?.image || '',
      text: tileData?.text || '',
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

// SPRITES STYLE
const updatePlayerPos = (tileId) => {
  const tile = tiles.value[tileId]
  const row = Math.floor(tile.id / boardSize.value)
  const col = tile.id % boardSize.value
  currentTilePos.value = {
    top: row * tileSize.value,
    left: col * tileSize.value,
  }
}

const setFinishPos = () => {
  const row = Math.floor(lastTilePos.value.id / boardSize.value)
  const col = lastTilePos.value.id % boardSize.value
  lastTilePos.value = {
    top: row * tileSize.value,
    left: col * tileSize.value,
  }
}

const playerStyle = computed(() => ({
  width: `${tileSize.value * 0.8}px`,
  height: `${tileSize.value * 0.5}px`,
  top: `${currentTilePos.value?.top - tileSize.value * 0.33}px`,
  left: `${currentTilePos.value?.left - tileSize.value * 0.2}px`,
}))

const kiteStyle = computed(() => ({
  width: `${tileSize.value * 0.35}px`,
  height: `${tileSize.value * 0.9}px`,
  top: `${lastTilePos.value?.top + tileSize.value * 0.7}px`,
  left: `${lastTilePos.value?.left + tileSize.value * 0.9}px`,
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
      hint.value = 'Pomôcka: Hoď kockou a číslo, ktoré ti padne je počet ťahov.'
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
      :disabled="!firstTile?.answered || stepsRemaining > 0 || freezeTiles"
      @rolled="onDiceRolled"
    />
  </header>

  <main>
    <h2>{{ question }}</h2>

    <section
      class="board"
      :style="{
        gridTemplateColumns: `repeat(${boardSize}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${boardSize}, ${tileSize}px)`,
      }"
    >
      <div v-if="currentTilePos" :style="playerStyle" class="player ellipse"></div>

      <div v-if="lastTilePos" :style="kiteStyle" class="kite shakeY"></div>

      <Tile
        v-for="tile in tiles"
        :id="tile.id"
        :key="tile.id"
        :answer="tile.answer"
        :image="tile.image"
        :text="tile.text"
        :visible="tile.visible"
        :answered="tile.answered"
        :steppable="isSteppable(tile)"
        :current-tile="tile.id === currentTile"
        :last-tile="tile.lastTile"
        :style="{
          width: tileSize + 'px',
          height: tileSize + 'px',
        }"
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
    <div class="btn-conatiner">
      <button @click="switchData('renaissance')">🖼️</button>
      <button @click="switchData('space')">☀️</button>

      <button class="reset-btn" @click="startGame">Hrať znovu</button>
    </div>

    <div class="hint">{{ hint }}</div>
  </footer>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-evenly;
  align-items: end;
}

h2 {
  max-width: 40rem;
}

.player,
.kite {
  position: absolute;
  z-index: 10;
}

.player {
  /* width: 80px;
  height: 50px; */
  background: url('/img/player.png');
  background-size: cover;
  transition:
    top 0.6s ease,
    left 0.6s ease;
}

.kite {
  /* width: 35px;
  height: 85px; */
  background: url('/img/kite.png');
  background-size: cover;
}

.btn-conatiner {
  display: flex;
}

button {
  border: none;
  margin: 0.3rem;
  padding: 0;
  width: auto;
  overflow: visible;
  cursor: pointer;

  background: transparent;

  font-size: 1.8rem;
}

.reset-btn {
  font-size: inherit;
  background: #ffaaac;
  color: #000;
  margin: auto 0 auto 0.7rem;
  padding-right: 10px;
  padding-left: 10px;
  min-height: 28px;
  font-weight: 700;
  border-radius: 5px;
  border: none;
  /* align-self: start; */
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
