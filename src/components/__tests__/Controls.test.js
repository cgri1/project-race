import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import Controls from '../Controls.vue'

describe('Controls', () => {
  let store
  let wrapper

  const createMockStore = (state = {}, getters = {}) => {
    const store = createStore({
      state: {
        status: 'idle',
        schedule: [],
        ...state
      },
      getters: {
        currentRound: () => null,
        raceElapsedTime: () => 0,
        ...getters
      },
      mutations: {
        reset: vi.fn()
      },
      actions: {
        initialize: vi.fn(),
        generateSchedule: vi.fn(),
        startRace: vi.fn()
      }
    })

    // Mock dispatch and commit as spy functions
    store.dispatch = vi.fn()
    store.commit = vi.fn()

    return store
  }

  const mountComponent = (store) => {
    return mount(Controls, {
      global: {
        plugins: [store]
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Template Rendering', () => {
    it('should render all control buttons', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('button[data-testid="init"]').exists()).toBe(true)
      expect(wrapper.find('button[data-testid="generate"]').exists()).toBe(true)
      expect(wrapper.find('button[data-testid="start"]').exists()).toBe(true)
      expect(wrapper.find('button[data-testid="reset"]').exists()).toBe(true)
    })

    it('should display status information', () => {
      store = createMockStore({ status: 'running' })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.meta').text()).toContain('Status: running')
    })

    it('should display current round information when available', () => {
      const mockRound = { id: 1, distance: 1200 }
      store = createMockStore({}, {
        currentRound: () => mockRound
      })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.meta').text()).toContain('Current Round: 1 (1200m)')
    })

    it('should display elapsed time when racing', () => {
      store = createMockStore({ status: 'running' }, {
        currentRound: () => ({ id: 1, distance: 1200 }),
        raceElapsedTime: () => 5.5
      })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.meta').text()).toContain('Elapsed: 5.5s')
    })
  })

  describe('Computed Properties', () => {
    describe('canStart', () => {
      it('should be false when status is not scheduled', () => {
        store = createMockStore({ status: 'idle' })
        wrapper = mountComponent(store)
        
        expect(wrapper.vm.canStart).toBe(false)
      })

      it('should be false when schedule is empty', () => {
        store = createMockStore({ status: 'scheduled', schedule: [] })
        wrapper = mountComponent(store)
        
        expect(wrapper.vm.canStart).toBe(false)
      })

      it('should be true when status is scheduled and schedule has items', () => {
        store = createMockStore({ 
          status: 'scheduled', 
          schedule: [{ id: 1, distance: 1200, horses: [1, 2, 3] }] 
        })
        wrapper = mountComponent(store)
        
        expect(wrapper.vm.canStart).toBe(true)
      })
    })

    describe('isRunning', () => {
      it('should be true when status is running', () => {
        store = createMockStore({ status: 'running' })
        wrapper = mountComponent(store)
        
        expect(wrapper.vm.isRunning).toBe(true)
      })

      it('should be false when status is not running', () => {
        store = createMockStore({ status: 'idle' })
        wrapper = mountComponent(store)
        
        expect(wrapper.vm.isRunning).toBe(false)
      })
    })

    describe('elapsedTime', () => {
      it('should return race elapsed time from getter', () => {
        store = createMockStore({}, {
          raceElapsedTime: () => 10.5
        })
        wrapper = mountComponent(store)
        
        expect(wrapper.vm.elapsedTime).toBe(10.5)
      })
    })
  })

  describe('Methods', () => {
    beforeEach(() => {
      store = createMockStore()
      wrapper = mountComponent(store)
    })

    describe('onInitialize', () => {
      it('should call initialize action', () => {
        wrapper.vm.onInitialize()
        expect(store.dispatch).toHaveBeenCalledWith('initialize')
      })
    })

    describe('onGenerate', () => {
      it('should call generateSchedule action', () => {
        wrapper.vm.onGenerate()
        expect(store.dispatch).toHaveBeenCalledWith('generateSchedule')
      })
    })

    describe('onStart', () => {
      it('should call startRace action', async () => {
        await wrapper.vm.onStart()
        expect(store.dispatch).toHaveBeenCalledWith('startRace')
      })
    })

    describe('onReset', () => {
      it('should commit reset mutation', () => {
        wrapper.vm.onReset()
        expect(store.commit).toHaveBeenCalledWith('reset')
      })
    })
  })

  describe('Button States', () => {
    describe('Init Horses Button', () => {
      it('should be disabled when race is running', () => {
        store = createMockStore({ status: 'running' })
        wrapper = mountComponent(store)
        
        const initButton = wrapper.find('button[data-testid="init"]')
        expect(initButton.attributes('disabled')).toBeDefined()
      })

      it('should be enabled when race is not running', () => {
        store = createMockStore({ status: 'idle' })
        wrapper = mountComponent(store)
        
        const initButton = wrapper.find('button[data-testid="init"]')
        expect(initButton.attributes('disabled')).toBeUndefined()
      })
    })

    describe('Generate Schedule Button', () => {
      it('should be disabled when race is running', () => {
        store = createMockStore({ status: 'running' })
        wrapper = mountComponent(store)
        
        const generateButton = wrapper.find('button[data-testid="generate"]')
        expect(generateButton.attributes('disabled')).toBeDefined()
      })

      it('should be enabled when race is not running', () => {
        store = createMockStore({ status: 'idle' })
        wrapper = mountComponent(store)
        
        const generateButton = wrapper.find('button[data-testid="generate"]')
        expect(generateButton.attributes('disabled')).toBeUndefined()
      })
    })

    describe('Start Button', () => {
      it('should be disabled when canStart is false', () => {
        store = createMockStore({ status: 'idle' })
        wrapper = mountComponent(store)
        
        const startButton = wrapper.find('button[data-testid="start"]')
        expect(startButton.attributes('disabled')).toBeDefined()
      })

      it('should be enabled when canStart is true', () => {
        store = createMockStore({ 
          status: 'scheduled', 
          schedule: [{ id: 1, distance: 1200, horses: [1, 2, 3] }] 
        })
        wrapper = mountComponent(store)
        
        const startButton = wrapper.find('button[data-testid="start"]')
        expect(startButton.attributes('disabled')).toBeUndefined()
      })
    })

    describe('Reset Button', () => {
      it('should always be enabled', () => {
        store = createMockStore({ status: 'running' })
        wrapper = mountComponent(store)
        
        const resetButton = wrapper.find('button[data-testid="reset"]')
        expect(resetButton.attributes('disabled')).toBeUndefined()
      })
    })
  })

  describe('User Interactions', () => {
    beforeEach(() => {
      store = createMockStore()
      wrapper = mountComponent(store)
    })

    it('should call onInitialize when Init Horses button is clicked', async () => {
      const initButton = wrapper.find('button[data-testid="init"]')
      await initButton.trigger('click')
      
      expect(store.dispatch).toHaveBeenCalledWith('initialize')
    })

    it('should call onGenerate when Generate Schedule button is clicked', async () => {
      const generateButton = wrapper.find('button[data-testid="generate"]')
      await generateButton.trigger('click')
      
      expect(store.dispatch).toHaveBeenCalledWith('generateSchedule')
    })

    it('should call onStart when Start button is clicked', async () => {
      // Enable start button
      store = createMockStore({ 
        status: 'scheduled', 
        schedule: [{ id: 1, distance: 1200, horses: [1, 2, 3] }] 
      })
      wrapper = mountComponent(store)
      

      const startButton = wrapper.find('button[data-testid="start"]')
      await startButton.trigger('click')
      
      expect(store.dispatch).toHaveBeenCalledWith('startRace')
    })

    it('should call onReset when Reset button is clicked', async () => {
      const resetButton = wrapper.find('button[data-testid="reset"]')
      await resetButton.trigger('click')
      
      expect(store.commit).toHaveBeenCalledWith('reset')
    })
  })

  describe('Status Display Logic', () => {
    it('should show different status messages based on state', () => {
      const statuses = ['idle', 'scheduled', 'running', 'finished']
      
      statuses.forEach(status => {
        store = createMockStore({ status })
        wrapper = mountComponent(store)
        
        expect(wrapper.find('.meta').text()).toContain(`Status: ${status}`)
      })
    })

    it('should conditionally show round information', () => {
      // No round
      store = createMockStore({}, { currentRound: () => null })
      wrapper = mountComponent(store)
      expect(wrapper.find('.meta').text()).not.toContain('Current Round')
      
      // With round
      const mockRound = { id: 2, distance: 1600 }
      store = createMockStore({}, { currentRound: () => mockRound })
      wrapper = mountComponent(store)
      expect(wrapper.find('.meta').text()).toContain('Current Round: 2 (1600m)')
    })

    it('should conditionally show elapsed time', () => {
      // Not racing
      store = createMockStore({ status: 'idle' })
      wrapper = mountComponent(store)
      expect(wrapper.find('.meta').text()).not.toContain('Elapsed')
      
      // Racing
      store = createMockStore({ status: 'running' }, { 
        currentRound: () => ({ id: 1, distance: 1200 }),
        raceElapsedTime: () => 3.2 
      })
      wrapper = mountComponent(store)
      expect(wrapper.find('.meta').text()).toContain('Elapsed: 3.2s')
    })
  })

  describe('Button Text and Labels', () => {
    it('should have correct button text', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('button[data-testid="init"]').text()).toBe('Init Horses')
      expect(wrapper.find('button[data-testid="generate"]').text()).toBe('Generate Schedule')
      expect(wrapper.find('button[data-testid="start"]').text()).toBe('Start')
      expect(wrapper.find('button[data-testid="reset"]').text()).toBe('Reset')
    })
  })
})
