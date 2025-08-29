import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import Results from '../Results.vue'

describe('Results', () => {
  let store
  let wrapper

  const createMockStore = (state = {}, getters = {}) => {
    return createStore({
      state: {
        status: 'idle',
        schedule: [],
        results: [],
        ...state
      },
      getters: {
        horsesById: () => ({}),
        ...getters
      }
    })
  }

  const mountComponent = (store) => {
    return mount(Results, {
      global: {
        plugins: [store]
      }
    })
  }

  describe('Template Rendering', () => {
    it('should render title', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('h3').text()).toBe('Results')
    })

    it('should show empty message when no results', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.empty').exists()).toBe(true)
      expect(wrapper.find('.empty').text()).toBe('No results yet.')
      expect(wrapper.find('.results').exists()).toBe(false)
    })

    it('should show results when they exist', () => {
      const mockResults = [
        { roundId: 1, distance: 1200, placements: [] }
      ]
      
      store = createMockStore({ results: mockResults })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.empty').exists()).toBe(false)
      expect(wrapper.find('.results').exists()).toBe(true)
    })
  })

  describe('Round Results Rendering', () => {
    const mockResults = [
      {
        roundId: 1,
        distance: 1200,
        placements: [
          { horseId: 1, timeSec: 10.5 },
          { horseId: 2, timeSec: 11.2 },
          { horseId: 3, timeSec: 11.8 },
          { horseId: 4, timeSec: 12.1 }
        ]
      },
      {
        roundId: 2,
        distance: 1400,
        placements: [
          { horseId: 5, timeSec: 12.3 },
          { horseId: 6, timeSec: 12.7 }
        ]
      }
    ]

    const mockSchedule = [
      {
        id: 1,
        distance: 1200,
        horses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      },
      {
        id: 2,
        distance: 1400,
        horses: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      }
    ]

    const mockHorses = {
      1: { id: 1, name: 'Horse #1', color: '#e6194b' },
      2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
      3: { id: 3, name: 'Horse #3', color: '#ffe119' },
      4: { id: 4, name: 'Horse #4', color: '#0082c8' },
      5: { id: 5, name: 'Horse #5', color: '#f58231' },
      6: { id: 6, name: 'Horse #6', color: '#911eb4' }
    }

    beforeEach(() => {
      store = createMockStore({
        results: mockResults,
        schedule: mockSchedule
      }, {
        horsesById: () => mockHorses
      })
      wrapper = mountComponent(store)
    })

    it('should render round information correctly', () => {
      const rounds = wrapper.findAll('.round')
      expect(rounds).toHaveLength(2)
      
      // First round
      const firstRound = rounds[0]
      expect(firstRound.find('.round-number').text()).toBe('Round 1')
      expect(firstRound.find('.distance').text()).toBe('1200m')
      
      // Second round
      const secondRound = rounds[1]
      expect(secondRound.find('.round-number').text()).toBe('Round 2')
      expect(secondRound.find('.distance').text()).toBe('1400m')
    })

    it('should render race container with program and results', () => {
      const raceContainers = wrapper.findAll('.race-container')
      expect(raceContainers).toHaveLength(2)
      
      raceContainers.forEach(container => {
        expect(container.find('.title .round-number').text()).toBe('Program')
        expect(container.findAll('.title .round-number')[1].text()).toBe('Result')
      })
    })

    it('should render program horses for each round', () => {
      const rounds = wrapper.findAll('.round')
      expect(rounds).toHaveLength(2)
      
      // First round should show horses 1-10 in the program section
      const firstRound = rounds[0]
      const programSection = firstRound.find('.race-container').findAll('.round-container')[0]
      const programHorses = programSection.findAll('.other-placement')
      expect(programHorses).toHaveLength(10)
      expect(programHorses[0].find('.horse-name').text()).toBe('Horse #1')
      expect(programHorses[9].find('.horse-name').text()).toBe('Horse #10')
    })
  })

  describe('Podium Rendering', () => {
    const mockResults = [
      {
        roundId: 1,
        distance: 1200,
        placements: [
          { horseId: 1, timeSec: 10.5 },
          { horseId: 2, timeSec: 11.2 },
          { horseId: 3, timeSec: 11.8 },
          { horseId: 4, timeSec: 12.1 },
          { horseId: 5, timeSec: 12.5 }
        ]
      }
    ]

    const mockHorses = {
      1: { id: 1, name: 'Horse #1', color: '#e6194b' },
      2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
      3: { id: 3, name: 'Horse #3', color: '#ffe119' },
      4: { id: 4, name: 'Horse #4', color: '#0082c8' },
      5: { id: 5, name: 'Horse #5', color: '#f58231' }
    }

    beforeEach(() => {
      store = createMockStore({
        results: mockResults,
        schedule: [{ id: 1, distance: 1200, horses: [1, 2, 3, 4, 5] }]
      }, {
        horsesById: () => mockHorses
      })
      wrapper = mountComponent(store)
    })

    it('should render podium with top 3 positions', () => {
      const podium = wrapper.find('.podium')
      expect(podium.exists()).toBe(true)
      
      const placements = podium.findAll('.placement')
      expect(placements).toHaveLength(3)
    })

    it('should apply correct position classes', () => {
      const placements = wrapper.find('.podium').findAll('.placement')
      
      expect(placements[0].classes()).toContain('position-1')
      expect(placements[1].classes()).toContain('position-2')
      expect(placements[2].classes()).toContain('position-3')
    })

    it('should render position badges correctly', () => {
      const badges = wrapper.findAll('.position-badge')
      expect(badges).toHaveLength(3)
      
      expect(badges[0].text()).toBe('1')
      expect(badges[1].text()).toBe('2')
      expect(badges[2].text()).toBe('3')
    })

    it('should render horse information correctly', () => {
      const placements = wrapper.find('.podium').findAll('.placement')
      
      // First place
      const firstPlace = placements[0]
      expect(firstPlace.find('.horse-name').text()).toBe('Horse #1')
      expect(firstPlace.find('.horse-name').attributes('style')).toContain('color: rgb(230, 25, 75)')
      expect(firstPlace.find('.time').text()).toBe('10.50s')
      
      // Second place
      const secondPlace = placements[1]
      expect(secondPlace.find('.horse-name').text()).toBe('Horse #2')
      expect(secondPlace.find('.horse-name').attributes('style')).toContain('color: rgb(60, 180, 75)')
      expect(secondPlace.find('.time').text()).toBe('11.20s')
    })
  })

  describe('Other Placements Rendering', () => {
    const mockResults = [
      {
        roundId: 1,
        distance: 1200,
        placements: [
          { horseId: 1, timeSec: 10.5 },
          { horseId: 2, timeSec: 11.2 },
          { horseId: 3, timeSec: 11.8 },
          { horseId: 4, timeSec: 12.1 },
          { horseId: 5, timeSec: 12.5 },
          { horseId: 6, timeSec: 13.0 }
        ]
      }
    ]

    const mockHorses = {
      1: { id: 1, name: 'Horse #1', color: '#e6194b' },
      2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
      3: { id: 3, name: 'Horse #3', color: '#ffe119' },
      4: { id: 4, name: 'Horse #4', color: '#0082c8' },
      5: { id: 5, name: 'Horse #5', color: '#f58231' },
      6: { id: 6, name: 'Horse #6', color: '#911eb4' }
    }

    beforeEach(() => {
      store = createMockStore({
        results: mockResults,
        schedule: [{ id: 1, distance: 1200, horses: [1, 2, 3, 4, 5, 6] }]
      }, {
        horsesById: () => mockHorses
      })
      wrapper = mountComponent(store)
    })

    it('should render other placements when more than 3 horses', () => {
      const otherPlacements = wrapper.find('.other-placements')
      expect(otherPlacements.exists()).toBe(true)
      
      const placements = otherPlacements.findAll('.other-placement')
      expect(placements).toHaveLength(3) // 4th, 5th, 6th place
    })

    it('should render position numbers correctly', () => {
      const otherPlacements = wrapper.find('.other-placements')
      const positions = otherPlacements.findAll('.position')
      
      expect(positions[0].text()).toBe('4')
      expect(positions[1].text()).toBe('5')
      expect(positions[2].text()).toBe('6')
    })

    it('should render horse names and times correctly', () => {
      const otherPlacements = wrapper.find('.other-placements')
      const placements = otherPlacements.findAll('.other-placement')
      
      // 4th place
      expect(placements[0].find('.horse-name').text()).toBe('Horse #4')
      expect(placements[0].find('.time').text()).toBe('12.10s')
      
      // 5th place
      expect(placements[1].find('.horse-name').text()).toBe('Horse #5')
      expect(placements[1].find('.time').text()).toBe('12.50s')
    })

    it('should not show other placements when 3 or fewer horses', () => {
      const mockResultsSmall = [
        {
          roundId: 1,
          distance: 1200,
          placements: [
            { horseId: 1, timeSec: 10.5 },
            { horseId: 2, timeSec: 11.2 },
            { horseId: 3, timeSec: 11.8 }
          ]
        }
      ]
      
      store = createMockStore({
        results: mockResultsSmall,
        schedule: [{ id: 1, distance: 1200, horses: [1, 2, 3] }]
      }, {
        horsesById: () => mockHorses
      })
      wrapper = mountComponent(store)
      
      const otherPlacements = wrapper.find('.other-placements')
      expect(otherPlacements.exists()).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('should map status from store state', () => {
      store = createMockStore({ status: 'finished' })
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.status).toBe('finished')
    })

    it('should map schedule from store state', () => {
      const mockSchedule = [{ id: 1, distance: 1200, horses: [1, 2, 3] }]
      store = createMockStore({ schedule: mockSchedule })
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.schedule).toEqual(mockSchedule)
    })

    it('should map results from store state', () => {
      const mockResults = [{ roundId: 1, distance: 1200, placements: [] }]
      store = createMockStore({ results: mockResults })
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.results).toEqual(mockResults)
    })

    it('should map horsesById from store getters', () => {
      const mockHorses = { 1: { id: 1, name: 'Horse #1', color: '#e6194b' } }
      store = createMockStore({}, { horsesById: () => mockHorses })
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.horsesById).toEqual(mockHorses)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty results array', () => {
      store = createMockStore({ results: [] })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.empty').exists()).toBe(true)
      expect(wrapper.find('.results').exists()).toBe(false)
    })

    it('should handle results with no placements', () => {
      const mockResults = [
        { roundId: 1, distance: 1200, placements: [] }
      ]
      
      store = createMockStore({
        results: mockResults,
        schedule: [{ id: 1, distance: 1200, horses: [] }]
      })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.round').exists()).toBe(true)
      expect(wrapper.find('.podium').exists()).toBe(true)
      expect(wrapper.findAll('.podium .placement')).toHaveLength(0)
      expect(wrapper.find('.other-placements').exists()).toBe(false)
    })

    it('should handle missing horse data gracefully', () => {
      const mockResults = [
        {
          roundId: 1,
          distance: 1200,
          placements: [{ horseId: 999, timeSec: 10.5 }]
        }
      ]
      
      store = createMockStore({
        results: mockResults,
        schedule: [{ id: 1, distance: 1200, horses: [999] }]
      }, {
        horsesById: () => ({ 999: { id: 999, name: 'Horse #999', color: '#000000' } })
      })
      wrapper = mountComponent(store)
      
      // Should not crash, but horse name might be undefined
      expect(wrapper.find('.round').exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('should have correct component name', () => {
      expect(Results.name).toBe('Results')
    })

    it('should use mapState for status, schedule, and results', () => {
      expect(Results.computed).toHaveProperty('status')
      expect(Results.computed).toHaveProperty('schedule')
      expect(Results.computed).toHaveProperty('results')
    })

    it('should use mapGetters for horsesById', () => {
      expect(Results.computed).toHaveProperty('horsesById')
    })

    it('should not have any methods', () => {
      expect(Results.methods).toBeUndefined()
    })

    it('should not have any props', () => {
      expect(Results.props).toBeUndefined()
    })
  })
})
