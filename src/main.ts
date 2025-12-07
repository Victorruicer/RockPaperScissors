import './style.css'
import { Simulation } from './game/Simulation'
import type { GameStats, EntityType } from './game/types'

// DOM Elements
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const startBtn = document.getElementById('start-btn') as HTMLButtonElement
const rockInput = document.getElementById('rock-count') as HTMLInputElement
const paperInput = document.getElementById('paper-count') as HTMLInputElement
const scissorsInput = document.getElementById('scissors-count') as HTMLInputElement

const statRock = document.getElementById('stat-rock') as HTMLElement
const statPaper = document.getElementById('stat-paper') as HTMLElement
const statScissors = document.getElementById('stat-scissors') as HTMLElement

const winnerDisplay = document.getElementById('winner-display') as HTMLElement
const winnerText = document.getElementById('winner-text') as HTMLElement

// Simulation Instance
const simulation = new Simulation(
  canvas,
  updateStats,
  onGameOver
)

// Event Listeners
startBtn.addEventListener('click', () => {
  const config = {
    initialRock: parseInt(rockInput.value) || 0,
    initialPaper: parseInt(paperInput.value) || 0,
    initialScissors: parseInt(scissorsInput.value) || 0
  }

  // Reset UI
  winnerDisplay.classList.add('hidden')
  startBtn.textContent = 'Restart Simulation'

  simulation.stop()
  simulation.init(config)
  simulation.start()
})

function updateStats(stats: GameStats) {
  statRock.textContent = stats.rock.toString()
  statPaper.textContent = stats.paper.toString()
  statScissors.textContent = stats.scissors.toString()
}

function onGameOver(winner: EntityType) {
  winnerText.textContent = `${winner.toUpperCase()} WINS!`
  winnerDisplay.classList.remove('hidden')
  startBtn.textContent = 'Start Simulation'
}

// Initial resize
simulation.resize()
