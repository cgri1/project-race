import { createStore } from "vuex";

const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200];

const HORSE_COLORS = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#0082c8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#d2f53c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#aa6e28",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000080",
  "#808080",
];

function generateHorses() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Horse #${i + 1}`,
    color: HORSE_COLORS[i % HORSE_COLORS.length],
    condition: Math.floor(Math.random() * 100) + 1,
  }));
}

function pickRandomUnique(array, count) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, count);
}

function generateSchedule(horses) {
  return ROUND_DISTANCES.map((distance, roundIdx) => {
    const selected = pickRandomUnique(horses, 10).map((h) => h.id);
    return {
      id: roundIdx + 1,
      distance,
      horses: selected,
    };
  });
}

function computeSpeedMetersPerSec(condition) {
  const base = 16;
  const variance = ((condition - 50) / 50) * 0.2;
  return base * (1 + variance);
}

const store = createStore({
  state() {
    return {
      horses: [],
      schedule: [],
      currentRoundIndex: -1,
      roundProgress: {},
      roundFinishedOrder: [],
      results: [],
      status: "idle",
      animationSpeed: 1.0,
      raceStartTime: 0,
      animationInterval: null,
    };
  },
  getters: {
    currentRound(state) {
      if (
        state.currentRoundIndex < 0 ||
        state.currentRoundIndex >= state.schedule.length
      )
        return null;
      return state.schedule[state.currentRoundIndex];
    },
    horsesById(state) {
      const map = {};
      for (const h of state.horses) map[h.id] = h;
      return map;
    },
    raceElapsedTime(state) {
      if (!state.raceStartTime) return 0;
      return (performance.now() - state.raceStartTime) / 1000;
    },
  },
  mutations: {
    setHorses(state, horses) {
      state.horses = horses;
    },
    setSchedule(state, schedule) {
      state.schedule = schedule;
      state.status = schedule.length ? "scheduled" : "idle";
    },
    reset(state) {
      state.schedule = [];
      state.currentRoundIndex = -1;
      state.roundProgress = {};
      state.roundFinishedOrder = [];
      state.results = [];
      state.status = "idle";
      state.raceStartTime = 0;
      if (state.animationInterval) {
        clearInterval(state.animationInterval);
        state.animationInterval = null;
      }
    },
    startRound(state, index) {
      state.currentRoundIndex = index;
      state.roundProgress = {};
      state.roundFinishedOrder = [];
      state.raceStartTime = performance.now();
      state.status = "running";
    },
    updateProgress(state, { horseId, meters }) {
      state.roundProgress[horseId] = meters;
    },
    markFinish(state, payload) {
      state.roundFinishedOrder.push(payload);
    },
    pushRoundResult(state, payload) {
      state.results.push(payload);
    },
    setAnimationInterval(state, interval) {
      state.animationInterval = interval;
    },
    clearAnimationInterval(state) {
      if (state.animationInterval) clearInterval(state.animationInterval);
      state.animationInterval = null;
    },
    setStatus(state, status) {
      state.status = status;
    },
    setAnimationSpeed(state, speed) {
      state.animationSpeed = Math.max(0.1, Math.min(3.0, speed));
    },
  },
  actions: {
    initialize({ commit }) {
      const horses = generateHorses();
      commit("setHorses", horses);
    },
    generateSchedule({ state, commit }) {
      if (!state.horses.length) {
        commit("setHorses", generateHorses());
      }
      const schedule = generateSchedule(state.horses);
      commit("setSchedule", schedule);
    },
    async startRace({ state, commit, dispatch, getters }) {
      if (!state.schedule.length) return;
      // 6 round
      for (let i = 0; i < state.schedule.length; i++) {
        commit("startRound", i);
        await dispatch("runCurrentRound");
        // delay between rounds
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      commit("setStatus", "finished");
    },
    runCurrentRound({ state, commit, getters }) {
      return new Promise((resolve) => {
        const round = getters.currentRound;
        if (!round) return resolve();

        const horsesInRound = round.horses.map((id) => getters.horsesById[id]);
        const distance = round.distance;

        const progress = {};
        const finished = new Set();
        const startTs = performance.now();
        const updateInterval = 50;

        const interval = setInterval(() => {
          const now = performance.now();
          const dtSec = (now - startTs) / 1000;

          // update each horse
          for (const horse of horsesInRound) {
            if (finished.has(horse.id)) continue;

            const baseSpeed = computeSpeedMetersPerSec(horse.condition);

            const conditionFactor = (horse.condition / 100) * 0.3 + 0.85;
            const jitter = (Math.random() - 0.5) * 0.5;
            const speed = Math.max(8, baseSpeed * conditionFactor + jitter);

            const currentProgress = Math.min(speed * dtSec, distance);
            progress[horse.id] = currentProgress;

            commit("updateProgress", {
              horseId: horse.id,
              meters: currentProgress,
            });

            if (currentProgress >= distance && !finished.has(horse.id)) {
              finished.add(horse.id);
              commit("markFinish", { horseId: horse.id, timeSec: dtSec });
            }
          }

          if (finished.size === horsesInRound.length) {
            // finale
            const placements = state.roundFinishedOrder
              .slice()
              .sort((a, b) => a.timeSec - b.timeSec);
            commit("pushRoundResult", {
              roundId: round.id,
              distance: round.distance,
              placements,
            });
            commit("clearAnimationInterval");
            clearInterval(interval);
            resolve();
            return;
          }
        }, updateInterval);

        commit("setAnimationInterval", interval);
      });
    },
  },
});

export default store;
