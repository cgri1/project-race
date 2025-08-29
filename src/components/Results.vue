<template>
  <div class="result-container">
    <h3>Results</h3>
    <div v-if="!results.length" class="empty">No results yet.</div>
    <div v-else class="results">
      <div class="round" v-for="r in results" :key="r.roundId">
        <div class="title">
          <span class="round-number">Round {{ r.roundId }}</span>
          <span class="distance">{{ r.distance }}m</span>
        </div>
        <div class="race-container">
          <div>
            <div class="title" :style="{ borderBottom: 0 }">
              <span class="round-number">Program</span>
            </div>
            <div class="round-container" v-for="a in schedule" :key="a.id">
              <div v-if="r.roundId === a.id">
                <div >
                  <div v-for="(p, index) in a.horses" :key="a.horses" class="other-placement">
                    <span class="horse-name">
                      Horse #{{ p }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="title" :style="{ borderBottom: 0 }">
              <span class="round-number">Result</span>
            </div>
            <div class="podium">
              <div v-for="(p, index) in r.placements.slice(0, 3)" :key="p.horseId" class="placement"
                :class="`position-${index + 1}`">
                <div class="position-badge">{{ index + 1 }}</div>
                <div class="horse-info">
                  <span class="horse-name" :style="{ color: horsesById[p.horseId].color }">
                    {{ horsesById[p.horseId].name }}
                  </span>
                  <span class="time">{{ p.timeSec.toFixed(2) }}s</span>
                </div>
              </div>
            </div>
            <div class="other-placements" v-if="r.placements.length > 3">
              <div v-for="(p, index) in r.placements.slice(3)" :key="p.horseId" class="other-placement">
                <span class="position">{{ index + 4 }}</span>
                <span class="horse-name" :style="{ color: horsesById[p.horseId].color }">
                  {{ horsesById[p.horseId].name }}
                </span>
                <span class="time">{{ p.timeSec.toFixed(2) }}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Results',
  computed: {
    ...mapState(['status', 'schedule']),
    ...mapState(['results']),
    ...mapGetters(['horsesById'])
  }
}
</script>

<style scoped>
.result-container {
  overflow: auto;
}
.round-container {
  color: black;
}

.race-container {
  display: grid;
  grid-template-columns: 50% 50%;
}

.empty {
  color: #777;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.round {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #dee2e6;
}

.round-number {
  font-weight: bold;
  font-size: 18px;
  color: #495057;
}

.distance {
  font-size: 14px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.podium {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.placement {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.position-1 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-color: #ffc107;
}

.position-2 {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  border-color: #adb5bd;
}

.position-3 {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  border-color: #b8860b;
}

.position-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.horse-info {
  text-align: center;
}

.horse-name {
  display: block;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.time {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
}

.other-placements {
  border-top: 1px solid #e9ecef;
  padding-top: 12px;
}

.other-placement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f8f9fa;
}

.other-placement:last-child {
  border-bottom: none;
}

.other-placement .position {
  width: 20px;
  text-align: center;
  font-weight: bold;
  color: #6c757d;
  font-size: 12px;
}

.other-placement .horse-name {
  flex: 1;
  font-size: 13px;
}

.other-placement .time {
  font-size: 11px;
  color: #6c757d;
  font-family: monospace;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .podium {
    flex-direction: column;
    gap: 6px;
  }

  .placement {
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 12px;
  }

  .position-badge {
    margin-bottom: 0;
    margin-right: 12px;
  }

  .horse-info {
    text-align: left;
    flex: 1;
  }
}
</style>
