import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import RaceTrack from '../RaceTrack.vue'

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null
}

describe('RaceTrack', () => {
  let store
  let wrapper

  const createMockStore = (state = {}, getters = {}) => {
    return createStore({
      state: {
        roundProgress: {},
        status: 'idle',
        ...state
      },
      getters: {
        currentRound: () => null,
        horsesById: () => ({}),
        ...getters
      }
    })
  }

  const mountComponent = (store) => {
    return mount(RaceTrack, {
      global: {
        plugins: [store]
      }
    })
  }

  describe('Template Rendering', () => {
    it('should show placeholder when no round is selected', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.placeholder').exists()).toBe(true)
      expect(wrapper.find('.placeholder').text()).toBe('No round selected. Generate and Start to race.')
      expect(wrapper.find('.track').exists()).toBe(false)
    })

    it('should show race track when round is selected', () => {
      const mockRound = {
        id: 1,
        distance: 1200,
        horses: [1, 2, 3]
      }
      
      const mockHorses = {
        1: { id: 1, name: 'Horse #1', color: '#e6194b' },
        2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
        3: { id: 3, name: 'Horse #3', color: '#ffe119' }
      }
      
      store = createMockStore({}, {
        currentRound: () => mockRound,
        horsesById: () => mockHorses
      })
      
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.placeholder').exists()).toBe(false)
      expect(wrapper.find('.track').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Round 1 – 1200m')
    })

    it('should render track header with correct columns', () => {
      const mockRound = {
        id: 1,
        distance: 1200,
        horses: [1, 2, 3]
      }
      
      const mockHorses = {
        1: { id: 1, name: 'Horse #1', color: '#e6194b' },
        2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
        3: { id: 3, name: 'Horse #3', color: '#ffe119' }
      }
      
      store = createMockStore({}, {
        currentRound: () => mockRound,
        horsesById: () => mockHorses
      })
      
      wrapper = mountComponent(store)
      
      const header = wrapper.find('.track-header')
      expect(header.find('.lane-number').text()).toBe('Lane')
      expect(header.find('.horse-name').text()).toBe('Horse')
      expect(header.find('.progress-label').text()).toBe('Progress')
      expect(header.find('.finish-line').exists()).toBe(true)
    })

    it('should render lanes for each horse', () => {
      const mockRound = {
        id: 1,
        distance: 1200,
        horses: [1, 2, 3]
      }
      
      const mockHorses = {
        1: { id: 1, name: 'Horse #1', color: '#e6194b' },
        2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
        3: { id: 3, name: 'Horse #3', color: '#ffe119' }
      }
      
      store = createMockStore({}, {
        currentRound: () => mockRound,
        horsesById: () => mockHorses
      })
      
      wrapper = mountComponent(store)
      
      const lanes = wrapper.findAll('.lane')
      expect(lanes).toHaveLength(3)
      
      // Check first lane
      expect(lanes[0].find('.lane-number').text()).toBe('1')
      expect(lanes[0].find('.label span:last-child').text()).toBe('Horse #1')
      expect(lanes[0].find('.swatch').attributes('style')).toContain('background-color: rgb(230, 25, 75)')
    })
  })

  describe('Computed Properties', () => {
    it('should compute isRacing correctly', () => {
      store = createMockStore({ status: 'running' })
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.isRacing).toBe(true)
    })

    it('should compute isRacing as false when not running', () => {
      store = createMockStore({ status: 'idle' })
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.isRacing).toBe(false)
    })
  })

  describe('Methods', () => {
    beforeEach(() => {
      // Don't set up store here - let each test set up its own store
    })

    describe('positionStyle', () => {
      it('should return empty object when no current round', () => {
        store = createMockStore()
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.positionStyle(1, 0)
        expect(result).toEqual({})
      })

      it('should calculate position style correctly', () => {
        const mockRound = { id: 1, distance: 1200, horses: [1, 2, 3] }
        const mockHorses = { 
          1: { id: 1, name: 'Horse #1', color: '#e6194b' },
          2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
          3: { id: 3, name: 'Horse #3', color: '#ffe119' }
        }
        
        store = createMockStore({}, {
          currentRound: () => mockRound,
          horsesById: () => mockHorses
        })
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.positionStyle(1, 0)
        
        expect(result).toHaveProperty('transform')
        expect(result).toHaveProperty('transitionDelay')
        expect(result).toHaveProperty('transition')
        expect(result.transform).toContain('translateX(0%)')
        expect(result.transitionDelay).toBe('0s')
      })

      it('should calculate position with progress', () => {
        store = createMockStore({
          roundProgress: { 1: 600 } // 50% of 1200m
        }, {
          currentRound: () => ({ id: 1, distance: 1200, horses: [1, 2, 3] }),
          horsesById: () => ({ 
            1: { id: 1, name: 'Horse #1', color: '#e6194b' },
            2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
            3: { id: 3, name: 'Horse #3', color: '#ffe119' }
          })
        })
        
        wrapper = mountComponent(store)
        const result = wrapper.vm.positionStyle(1, 0)
        
        expect(result.transform).toContain('translateX(50%)')
      })

      it('should apply stagger delay based on lane index', () => {
        const mockRound = { id: 1, distance: 1200, horses: [1, 2, 3] }
        const mockHorses = { 
          1: { id: 1, name: 'Horse #1', color: '#e6194b' },
          2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
          3: { id: 3, name: 'Horse #3', color: '#ffe119' }
        }
        
        store = createMockStore({}, {
          currentRound: () => mockRound,
          horsesById: () => mockHorses
        })
        wrapper = mountComponent(store)
        
        const result1 = wrapper.vm.positionStyle(1, 0)
        const result2 = wrapper.vm.positionStyle(2, 1)
        
        expect(result1.transitionDelay).toBe('0s')
        expect(result2.transitionDelay).toBe('0.05s')
      })

      it('should use racing transition when racing', () => {
        store = createMockStore({ status: 'running' }, {
          currentRound: () => ({ id: 1, distance: 1200, horses: [1, 2, 3] }),
          horsesById: () => ({ 
            1: { id: 1, name: 'Horse #1', color: '#e6194b' },
            2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
            3: { id: 3, name: 'Horse #3', color: '#ffe119' }
          })
        })
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.positionStyle(1, 0)
        expect(result.transition).toBe('transform 0.05s linear')
      })

      it('should use non-racing transition when not racing', () => {
        store = createMockStore({ status: 'idle' }, {
          currentRound: () => ({ id: 1, distance: 1200, horses: [1, 2, 3] }),
          horsesById: () => ({ 
            1: { id: 1, name: 'Horse #1', color: '#e6194b' },
            2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
            3: { id: 3, name: 'Horse #3', color: '#ffe119' }
          })
        })
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.positionStyle(1, 0)
        expect(result.transition).toBe('transform 0.3s ease-in-out')
      })
    })

    describe('progressFillStyle', () => {
      it('should return empty object when no current round', () => {
        store = createMockStore()
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.progressFillStyle(1)
        expect(result).toEqual({})
      })

      it('should calculate progress fill style correctly', () => {
        const mockRound = { id: 1, distance: 1200, horses: [1, 2, 3] }
        const mockHorses = { 
          1: { id: 1, name: 'Horse #1', color: '#e6194b' },
          2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
          3: { id: 3, name: 'Horse #3', color: '#ffe119' }
        }
        
        store = createMockStore({}, {
          currentRound: () => mockRound,
          horsesById: () => mockHorses
        })
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.progressFillStyle(1)
        
        expect(result).toHaveProperty('width')
        expect(result).toHaveProperty('backgroundColor')
        expect(result).toHaveProperty('opacity')
        expect(result.width).toBe('0%')
        expect(result.backgroundColor).toBe('#e6194b')
        expect(result.opacity).toBe(0.3)
      })

      it('should calculate progress with actual progress', () => {
        store = createMockStore({
          roundProgress: { 1: 600 } // 50% of 1200m
        }, {
          currentRound: () => ({ id: 1, distance: 1200, horses: [1, 2, 3] }),
          horsesById: () => ({ 
            1: { id: 1, name: 'Horse #1', color: '#e6194b' },
            2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
            3: { id: 3, name: 'Horse #3', color: '#ffe119' }
          })
        })
        
        wrapper = mountComponent(store)
        const result = wrapper.vm.progressFillStyle(1)
        
        expect(result.width).toBe('50%')
      })

      it('should cap progress at 100%', () => {
        store = createMockStore({
          roundProgress: { 1: 1500 } // Over 100% of 1200m
        }, {
          currentRound: () => ({ id: 1, distance: 1200, horses: [1, 2, 3] }),
          horsesById: () => ({ 
            1: { id: 1, name: 'Horse #1', color: '#e6194b' },
            2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
            3: { id: 3, name: 'Horse #3', color: '#ffe119' }
          })
        })
        
        wrapper = mountComponent(store)
        const result = wrapper.vm.progressFillStyle(1)
        
        expect(result.width).toBe('100%')
      })
    })

    describe('isFinished', () => {
      it('should return false when no current round', () => {
        store = createMockStore()
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.isFinished(1)
        expect(result).toBe(false)
      })

      it('should return false when horse has not finished', () => {
        const mockRound = { id: 1, distance: 1200, horses: [1, 2, 3] }
        const mockHorses = { 
          1: { id: 1, name: 'Horse #1', color: '#e6194b' },
          2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
          3: { id: 3, name: 'Horse #3', color: '#ffe119' }
        }
        
        store = createMockStore({}, {
          currentRound: () => mockRound,
          horsesById: () => mockHorses
        })
        wrapper = mountComponent(store)
        
        const result = wrapper.vm.isFinished(1)
        expect(result).toBe(false)
      })

      it('should return true when horse has finished', () => {
        store = createMockStore({
          roundProgress: { 1: 1200 } // Exactly at finish line
        }, {
          currentRound: () => ({ id: 1, distance: 1200, horses: [1, 2, 3] }),
          horsesById: () => ({ 
            1: { id: 1, name: 'Horse #1', color: '#e6194b' },
            2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
            3: { id: 3, name: 'Horse #3', color: '#ffe119' }
          })
        })
        
        wrapper = mountComponent(store)
        const result = wrapper.vm.isFinished(1)
        expect(result).toBe(true)
      })

      it('should return true when horse has exceeded finish line', () => {
        store = createMockStore({
          roundProgress: { 1: 1300 } // Over finish line
        }, {
          currentRound: () => ({ id: 1, distance: 1200, horses: [1, 2, 3] }),
          horsesById: () => ({ 
            1: { id: 1, name: 'Horse #1', color: '#e6194b' },
            2: { id: 2, name: 'Horse #2', color: '#3cb44b' },
            3: { id: 3, name: 'Horse #3', color: '#ffe119' }
          })
        })
        
        wrapper = mountComponent(store)
        const result = wrapper.vm.isFinished(1)
        expect(result).toBe(true)
      })
    })
  })

  describe('CSS Classes', () => {
    it('should apply racing class when horse is racing', () => {
      const mockRound = {
        id: 1,
        distance: 1200,
        horses: [1]
      }
      
      const mockHorses = {
        1: { id: 1, name: 'Horse #1', color: '#e6194b' }
      }
      
      store = createMockStore({ status: 'running' }, {
        currentRound: () => mockRound,
        horsesById: () => mockHorses
      })
      
      wrapper = mountComponent(store)
      
      const posElement = wrapper.find('.pos')
      expect(posElement.classes()).toContain('racing')
    })

    it('should apply finished class when horse has finished', () => {
      const mockRound = {
        id: 1,
        distance: 1200,
        horses: [1]
      }
      
      const mockHorses = {
        1: { id: 1, name: 'Horse #1', color: '#e6194b' }
      }
      
      store = createMockStore({
        roundProgress: { 1: 1200 }
      }, {
        currentRound: () => mockRound,
        horsesById: () => mockHorses
      })
      
      wrapper = mountComponent(store)
      
      const posElement = wrapper.find('.pos')
      expect(posElement.classes()).toContain('finished')
    })
  })

  describe('Progress Display', () => {
    it('should show progress text when racing', () => {
      const mockRound = {
        id: 1,
        distance: 1200,
        horses: [1]
      }
      
      const mockHorses = {
        1: { id: 1, name: 'Horse #1', color: '#e6194b' }
      }
      
      store = createMockStore({
        status: 'running',
        roundProgress: { 1: 600 }
      }, {
        currentRound: () => mockRound,
        horsesById: () => mockHorses
      })
      
      wrapper = mountComponent(store)
      
      const progressText = wrapper.find('.progress-text')
      expect(progressText.exists()).toBe(true)
      expect(progressText.text()).toBe('600m')
    })

    it('should not show progress text when not racing', () => {
      const mockRound = {
        id: 1,
        distance: 1200,
        horses: [1]
      }
      
      const mockHorses = {
        1: { id: 1, name: 'Horse #1', color: '#e6194b' }
      }
      
      store = createMockStore({ status: 'idle' }, {
        currentRound: () => mockRound,
        horsesById: () => mockHorses
      })
      
      wrapper = mountComponent(store)
      
      const progressText = wrapper.find('.progress-text')
      expect(progressText.exists()).toBe(false)
    })
  })
})
