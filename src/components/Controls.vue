<template>
  <div class="controls">
    <button data-testid="init" @click="onInitialize" :disabled="isRunning">Init Horses</button>
    <button data-testid="generate" @click="onGenerate" :disabled="isRunning">Generate Schedule</button>
    <button data-testid="start" @click="onStart" :disabled="!canStart">Start</button>
    <button data-testid="reset" @click="onReset">Reset</button>
  </div>
  
  <div class="meta">
    <div>Status: {{ status }}</div>
    <div v-if="currentRound">Current Round: {{ currentRound.id }} ({{ currentRound.distance }}m)</div>
    <div v-if="isRunning && currentRound">Elapsed: {{ elapsedTime.toFixed(1) }}s</div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'Controls',
  computed: {
    ...mapState(['status', 'schedule']),
    ...mapGetters(['currentRound', 'raceElapsedTime']),
    canStart() {
      return this.status === 'scheduled' && this.schedule.length > 0
    },
    isRunning() {
      return this.status === 'running'
    },
    isRacing() {
      return this.isRunning
    },
    elapsedTime() {
      return this.raceElapsedTime
    }
  },
  methods: {
    ...mapActions(['initialize', 'generateSchedule', 'startRace']),
    onInitialize() {
      this.initialize()
    },
    onGenerate() {
      this.generateSchedule()
    },
    async onStart() {
      await this.startRace()
    },
    onReset() {
      this.$store.commit('reset')
    }
  }
}
</script>

<style scoped>
.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s ease;
  color: black;
}

button:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.meta {
  margin: 8px 0 16px;
  color: #555;
}

.schedule ul {
  margin: 0;
  padding-left: 20px;
}
</style>


