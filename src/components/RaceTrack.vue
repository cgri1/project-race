<template>
  <div>
    <h3 v-if="currentRound">Round {{ currentRound.id }} – {{ currentRound.distance }}m</h3>
    <div v-if="currentRound" class="track">
      <div class="track-header">
        <div class="lane-number">Lane</div>
        <div class="horse-name">Horse</div>
        <div class="progress-label">Progress</div>
        <div class="finish-line" :style="{ boxShadow: 'none', background: 'none' }">Finish</div>
      </div>

      <div class="lane" v-for="(horseId, index) in currentRound.horses" :key="horseId">
        <div class="lane-number">{{ index + 1 }}</div>
        <div class="label">
          <span class="swatch" :style="{ backgroundColor: horsesById[horseId].color }"></span>
          <span :style="{ color: horsesById[horseId].color }">{{ horsesById[horseId].name }}</span>
        </div>
        <div class="bar">
          <div class="pos" :class="{ 'racing': isRacing, 'finished': isFinished(horseId) }"
            :style="positionStyle(horseId, index)"></div>
          <div class="progress-text" v-if="isRacing">
            {{ Math.round(roundProgress[horseId] || 0) }}m
          </div>
          <div class="progress-fill" :style="progressFillStyle(horseId)"></div>
        </div>
        <div class="finish-indicator">
          <div class="finish-line"></div>
        </div>
      </div>
    </div>
    <div v-else class="placeholder">No round selected. Generate and Start to race.</div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'RaceTrack',
  computed: {
    ...mapState(['roundProgress', 'status']),
    ...mapGetters(['currentRound', 'horsesById']),
    isRacing() {
      return this.status === 'running'
    }
  },
  methods: {
    positionStyle(horseId, index) {
      if (!this.currentRound) return {}
      const distance = this.currentRound.distance
      const progress = this.roundProgress[horseId] || 0
      const pct = Math.min(100, (progress / distance) * 100)

      const staggerDelay = index * 0.05

      return {
        transform: `translateX(${pct}%)`,
        transitionDelay: `${staggerDelay}s`,
        transition: this.isRacing ? 'transform 0.05s linear' : 'transform 0.3s ease-in-out'
      }
    },
    progressFillStyle(horseId) {
      if (!this.currentRound) return {}
      const distance = this.currentRound.distance
      const progress = this.roundProgress[horseId] || 0
      const pct = Math.min(100, (progress / distance) * 100)

      return {
        width: `${pct}%`,
        backgroundColor: this.horsesById[horseId].color,
        opacity: 0.3
      }
    },
    isFinished(horseId) {
      if (!this.currentRound) return false
      const distance = this.currentRound.distance
      const progress = this.roundProgress[horseId] || 0
      return progress >= distance
    }
  }
}
</script>

<style scoped>
.track {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #eee;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.track-header {
  display: grid;
  grid-template-columns: 40px 1fr 2fr 60px;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 2px solid #dee2e6;
  font-weight: bold;
  color: #495057;
  font-size: 14px;
}

.lane {
  display: grid;
  grid-template-columns: 40px 1fr 2fr 60px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.lane-number {
  text-align: center;
  font-weight: bold;
  color: #6c757d;
  font-size: 14px;
}

.label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  display: inline-block;
  border: 1px solid #dee2e6;
}

.bar {
  position: relative;
  height: 12px;
  background: linear-gradient(90deg, #e9ecef 0%, #f8f9fa 100%);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 6px;
  transition: width 0.05s linear;
  z-index: 1;
}

.pos {
  position: absolute;
  left: -10px;
  top: -6px;
  width: 20px;
  height: 24px;
  background: #495057;
  border-radius: 6px;
  transition: transform 0.05s linear;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pos.racing {
  background: #495057;
  box-shadow: 0 0 8px rgba(73, 80, 87, 0.6);
  animation: move 0.5s ease-in-out infinite alternate;
}

.pos.finished {
  background: #495057;
  box-shadow: 0 0 8px rgba(73, 80, 87, 0.8);
}

.progress-text {
  position: absolute;
  right: -50px;
  top: -2px;
  font-size: 11px;
  color: #495057;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 3px;
  z-index: 3;
}

.finish-indicator {
  position: relative;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.finish-line {
  width: 3px;
  height: 16px;
  background: repeating-linear-gradient(45deg,
      black,
      black 2px,
      #fff 2px,
      #fff 4px);
  border-radius: 2px;
  box-shadow: 0 0 4px black;
}

@keyframes move {
  from {
    transform: translateY(0px);
  }

  to {
    transform: translateY(-2px);
  }
}

.placeholder {
  color: #777;
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

/* Responsive adjustments */
@media (max-width: 768px) {

  .track-header,
  .lane {
    grid-template-columns: 30px 1fr 1.5fr 40px;
    gap: 8px;
  }

  .progress-text {
    right: -40px;
    font-size: 10px;
  }
}
</style>
