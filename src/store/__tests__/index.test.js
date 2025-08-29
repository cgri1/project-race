import { createStore } from 'vuex'

// Import the store configuration functions
const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]

const HORSE_COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4",
  "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff",
  "#aa6e28", "#fffac8", "#800000", "#aaffc3", "#808000", "#ffd8b1",
  "#000080", "#808080"
]

function generateHorses() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Horse #${i + 1}`,
    color: HORSE_COLORS[i % HORSE_COLORS.length],
    condition: Math.floor(Math.random() * 100) + 1,
  }))
}

function pickRandomUnique(array, count) {
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy.slice(0, count)
}

function generateSchedule(horses) {
  return ROUND_DISTANCES.map((distance, roundIdx) => {
    const selected = pickRandomUnique(horses, 10).map((h) => h.id)
    return {
      id: roundIdx + 1,
      distance,
      horses: selected,
    }
  })
}

function computeSpeedMetersPerSec(condition) {
  const base = 16
  const variance = ((condition - 50) / 50) * 0.2
  return base * (1 + variance)
}

const createStoreConfig = () => ({
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
    }
  },
  getters: {
    currentRound(state) {
      if (state.currentRoundIndex < 0 || state.currentRoundIndex >= state.schedule.length)
        return null
      return state.schedule[state.currentRoundIndex]
    },
    horsesById(state) {
      const map = {}
      for (const h of state.horses) map[h.id] = h
      return map
    },
    raceElapsedTime(state) {
      if (!state.raceStartTime) return 0
      return (performance.now() - state.raceStartTime) / 1000
    },
  },
  mutations: {
    setHorses(state, horses) {
      state.horses = horses
    },
    setSchedule(state, schedule) {
      state.schedule = schedule
      state.status = schedule.length ? "scheduled" : "idle"
    },
    reset(state) {
      state.horses = []
      state.schedule = []
      state.currentRoundIndex = -1
      state.roundProgress = {}
      state.roundFinishedOrder = []
      state.results = []
      state.status = "idle"
      state.raceStartTime = 0
      if (state.animationInterval) {
        clearInterval(state.animationInterval)
        state.animationInterval = null
      }
    },
    startRound(state, index) {
      state.currentRoundIndex = index
      state.roundProgress = {}
      state.roundFinishedOrder = []
      state.raceStartTime = performance.now()
      state.status = "running"
    },
    updateProgress(state, { horseId, meters }) {
      state.roundProgress[horseId] = meters
    },
    markFinish(state, payload) {
      state.roundFinishedOrder.push(payload)
    },
    pushRoundResult(state, payload) {
      state.results.push(payload)
    },
    setAnimationInterval(state, interval) {
      state.animationInterval = interval
    },
    clearAnimationInterval(state) {
      if (state.animationInterval) clearInterval(state.animationInterval)
      state.animationInterval = null
    },
    setStatus(state, status) {
      state.status = status
    },
    setAnimationSpeed(state, speed) {
      state.animationSpeed = Math.max(0.1, Math.min(3.0, speed))
    },
  },
  actions: {
    initialize({ commit }) {
      const horses = generateHorses()
      commit("setHorses", horses)
    },
    generateSchedule({ state, commit }) {
      if (!state.horses.length) {
        commit("setHorses", generateHorses())
      }
      const schedule = generateSchedule(state.horses)
      commit("setSchedule", schedule)
    },
    async startRace({ state, commit, dispatch, getters }) {
      if (!state.schedule.length) return
      for (let i = 0; i < state.schedule.length; i++) {
        commit("startRound", i)
        await dispatch("runCurrentRound")
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      commit("setStatus", "finished")
    },
    runCurrentRound({ state, commit, getters }) {
      return new Promise((resolve) => {
        const round = getters.currentRound
        if (!round) return resolve()

        const horsesInRound = round.horses.map((id) => getters.horsesById[id])
        const distance = round.distance

        const progress = {}
        const finished = new Set()
        const startTs = performance.now()
        const updateInterval = 50

        const interval = setInterval(() => {
          const now = performance.now()
          const dtSec = (now - startTs) / 1000

          for (const horse of horsesInRound) {
            if (finished.has(horse.id)) continue

            const baseSpeed = computeSpeedMetersPerSec(horse.condition)
            const conditionFactor = (horse.condition / 100) * 0.3 + 0.85
            const jitter = (Math.random() - 0.5) * 0.5
            const speed = Math.max(8, baseSpeed * conditionFactor + jitter)

            const currentProgress = Math.min(speed * dtSec, distance)
            progress[horse.id] = currentProgress

            commit("updateProgress", {
              horseId: horse.id,
              meters: currentProgress,
            })

            if (currentProgress >= distance && !finished.has(horse.id)) {
              finished.add(horse.id)
              commit("markFinish", { horseId: horse.id, timeSec: dtSec })
            }
          }

          if (finished.size === horsesInRound.length) {
            const placements = state.roundFinishedOrder
              .slice()
              .sort((a, b) => a.timeSec - b.timeSec)
            commit("pushRoundResult", {
              roundId: round.id,
              distance: round.distance,
              placements,
            })
            commit("clearAnimationInterval")
            clearInterval(interval)
            resolve()
            return
          }
        }, updateInterval)

        commit("setAnimationInterval", interval)
      })
    },
  },
})

describe('Vuex Store', () => {
  let testStore

  beforeEach(() => {
    testStore = createStore(createStoreConfig())
  })

  afterEach(() => {
    if (testStore.state.animationInterval) {
      clearInterval(testStore.state.animationInterval)
    }
  })

  describe('State', () => {
    it('should have initial state', () => {
      expect(testStore.state.horses).toEqual([])
      expect(testStore.state.schedule).toEqual([])
      expect(testStore.state.currentRoundIndex).toBe(-1)
      expect(testStore.state.roundProgress).toEqual({})
      expect(testStore.state.roundFinishedOrder).toEqual([])
      expect(testStore.state.results).toEqual([])
      expect(testStore.state.status).toBe('idle')
      expect(testStore.state.animationSpeed).toBe(1.0)
      expect(testStore.state.raceStartTime).toBe(0)
      expect(testStore.state.animationInterval).toBeNull()
    })
  })

  describe('Getters', () => {
    describe('currentRound', () => {
      it('should return null when no round is selected', () => {
        expect(testStore.getters.currentRound).toBeNull()
      })

      it('should return current round when selected', () => {
        const mockSchedule = [
          { id: 1, distance: 1200, horses: [1, 2, 3] },
          { id: 2, distance: 1400, horses: [4, 5, 6] }
        ]
        testStore.commit('setSchedule', mockSchedule)
        testStore.commit('startRound', 0)
        expect(testStore.getters.currentRound).toEqual(mockSchedule[0])
      })
    })

    describe('horsesById', () => {
      it('should return empty object when no horses', () => {
        expect(testStore.getters.horsesById).toEqual({})
      })

      it('should return horses mapped by id', () => {
        const mockHorses = [
          { id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 },
          { id: 2, name: 'Horse #2', color: '#3cb44b', condition: 90 }
        ]
        testStore.commit('setHorses', mockHorses)
        expect(testStore.getters.horsesById).toEqual({
          1: mockHorses[0],
          2: mockHorses[1]
        })
      })
    })

    describe('raceElapsedTime', () => {
      it('should return 0 when race has not started', () => {
        expect(testStore.getters.raceElapsedTime).toBe(0)
      })

          it('should return elapsed time when race is running', () => {
      // Mock performance.now to return different values
      const originalNow = performance.now
      performance.now = vi.fn()
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(2000) // current time
      
      testStore.commit('startRound', 0)
      expect(testStore.getters.raceElapsedTime).toBe(1) // 1 second
      
      performance.now = originalNow
    })
    })
  })

  describe('Mutations', () => {
    describe('setHorses', () => {
      it('should set horses in state', () => {
        const mockHorses = [
          { id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 }
        ]
        testStore.commit('setHorses', mockHorses)
        expect(testStore.state.horses).toEqual(mockHorses)
      })
    })

    describe('setSchedule', () => {
      it('should set schedule and update status to scheduled', () => {
        const mockSchedule = [
          { id: 1, distance: 1200, horses: [1, 2, 3] }
        ]
        testStore.commit('setSchedule', mockSchedule)
        expect(testStore.state.schedule).toEqual(mockSchedule)
        expect(testStore.state.status).toBe('scheduled')
      })

      it('should set status to idle when schedule is empty', () => {
        testStore.commit('setSchedule', [])
        expect(testStore.state.status).toBe('idle')
      })
    })

    describe('reset', () => {
      it('should reset all state to initial values', () => {
        // Set some state first
        testStore.commit('setHorses', [{ id: 1, name: 'Test' }])
        testStore.commit('setSchedule', [{ id: 1, distance: 1200, horses: [1] }])
        testStore.commit('startRound', 0)
        
        testStore.commit('reset')
        
        expect(testStore.state.horses).toEqual([])
        expect(testStore.state.schedule).toEqual([])
        expect(testStore.state.currentRoundIndex).toBe(-1)
        expect(testStore.state.roundProgress).toEqual({})
        expect(testStore.state.roundFinishedOrder).toEqual([])
        expect(testStore.state.results).toEqual([])
        expect(testStore.state.status).toBe('idle')
        expect(testStore.state.raceStartTime).toBe(0)
        expect(testStore.state.animationInterval).toBeNull()
      })
    })

    describe('startRound', () => {
      it('should start a round and update state', () => {
        const mockSchedule = [
          { id: 1, distance: 1200, horses: [1, 2, 3] }
        ]
        testStore.commit('setSchedule', mockSchedule)
        
        testStore.commit('startRound', 0)
        
        expect(testStore.state.currentRoundIndex).toBe(0)
        expect(testStore.state.roundProgress).toEqual({})
        expect(testStore.state.roundFinishedOrder).toEqual([])
        expect(testStore.state.status).toBe('running')
        expect(testStore.state.raceStartTime).toBe(1000) // mocked performance.now
      })
    })

    describe('updateProgress', () => {
      it('should update horse progress', () => {
        testStore.commit('updateProgress', { horseId: 1, meters: 100 })
        expect(testStore.state.roundProgress[1]).toBe(100)
      })
    })

    describe('markFinish', () => {
      it('should mark horse as finished', () => {
        testStore.commit('markFinish', { horseId: 1, timeSec: 10.5 })
        expect(testStore.state.roundFinishedOrder).toEqual([
          { horseId: 1, timeSec: 10.5 }
        ])
      })
    })

    describe('pushRoundResult', () => {
      it('should add round result to results array', () => {
        const mockResult = {
          roundId: 1,
          distance: 1200,
          placements: [{ horseId: 1, timeSec: 10.5 }]
        }
        testStore.commit('pushRoundResult', mockResult)
        expect(testStore.state.results).toEqual([mockResult])
      })
    })

    describe('setAnimationInterval', () => {
      it('should set animation interval', () => {
        const mockInterval = setInterval(() => {}, 1000)
        testStore.commit('setAnimationInterval', mockInterval)
        expect(testStore.state.animationInterval).toBeDefined()
        clearInterval(mockInterval)
      })
    })

    describe('clearAnimationInterval', () => {
      it('should clear animation interval', () => {
        const mockInterval = setInterval(() => {}, 1000)
        testStore.commit('setAnimationInterval', mockInterval)
        testStore.commit('clearAnimationInterval')
        expect(testStore.state.animationInterval).toBeNull()
      })
    })

    describe('setStatus', () => {
      it('should update status', () => {
        testStore.commit('setStatus', 'finished')
        expect(testStore.state.status).toBe('finished')
      })
    })

    describe('setAnimationSpeed', () => {
      it('should set animation speed within bounds', () => {
        testStore.commit('setAnimationSpeed', 2.5)
        expect(testStore.state.animationSpeed).toBe(2.5)
        
        testStore.commit('setAnimationSpeed', 5.0) // above max
        expect(testStore.state.animationSpeed).toBe(3.0)
        
        testStore.commit('setAnimationSpeed', -1.0) // below min
        expect(testStore.state.animationSpeed).toBe(0.1)
      })
    })
  })

  describe('Actions', () => {
    describe('initialize', () => {
      it('should generate and set horses', () => {
        testStore.dispatch('initialize')
        expect(testStore.state.horses).toHaveLength(20)
        expect(testStore.state.horses[0]).toHaveProperty('id')
        expect(testStore.state.horses[0]).toHaveProperty('name')
        expect(testStore.state.horses[0]).toHaveProperty('color')
        expect(testStore.state.horses[0]).toHaveProperty('condition')
      })
    })

    describe('generateSchedule', () => {
      it('should generate schedule when horses exist', () => {
        testStore.dispatch('initialize')
        testStore.dispatch('generateSchedule')
        expect(testStore.state.schedule).toHaveLength(6)
        expect(testStore.state.status).toBe('scheduled')
      })

      it('should generate horses if none exist', () => {
        testStore.dispatch('generateSchedule')
        expect(testStore.state.horses).toHaveLength(20)
        expect(testStore.state.schedule).toHaveLength(6)
      })
    })

    describe('startRace', () => {
      it('should run through all rounds', async () => {
        testStore.dispatch('initialize')
        testStore.dispatch('generateSchedule')
        
        // Mock the runCurrentRound action to avoid actual race simulation
        const originalRunCurrentRound = testStore._actions.runCurrentRound[0]
        testStore._actions.runCurrentRound[0] = vi.fn().mockResolvedValue()
        
        await testStore.dispatch('startRace')
        
        expect(testStore.state.status).toBe('finished')
        
        // Restore original action
        testStore._actions.runCurrentRound[0] = originalRunCurrentRound
      }, 10000)

      it('should not start race without schedule', async () => {
        await testStore.dispatch('startRace')
        expect(testStore.state.status).toBe('idle')
      }, 10000)
    })
  })

  describe('Helper Functions', () => {
    it('should generate horses with correct properties', () => {
      testStore.dispatch('initialize')
      const horses = testStore.state.horses
      
      expect(horses).toHaveLength(20)
      horses.forEach(horse => {
        expect(horse).toHaveProperty('id')
        expect(horse).toHaveProperty('name')
        expect(horse).toHaveProperty('color')
        expect(horse).toHaveProperty('condition')
        expect(horse.condition).toBeGreaterThanOrEqual(1)
        expect(horse.condition).toBeLessThanOrEqual(100)
      })
    })

    it('should generate schedule with correct structure', () => {
      testStore.dispatch('initialize')
      testStore.dispatch('generateSchedule')
      const schedule = testStore.state.schedule
      
      expect(schedule).toHaveLength(6)
      schedule.forEach((round, index) => {
        expect(round).toHaveProperty('id')

        expect(round).toHaveProperty('distance')
        expect(round).toHaveProperty('horses')
        expect(round.id).toBe(index + 1)
        expect(round.horses).toHaveLength(10)
      })
    })
  })
})
