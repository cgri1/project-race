import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import HorseList from '../HorseList.vue'

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null
}

describe('HorseList', () => {
  let store
  let wrapper

  const createMockStore = (state = {}) => {
    return createStore({
      state: {
        horses: [],
        ...state
      }
    })
  }

  const mountComponent = (store) => {
    return mount(HorseList, {
      global: {
        plugins: [store]
      }
    })
  }

  describe('Template Rendering', () => {
    it('should render title with horse count', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('h3').text()).toBe('All Horses (20)')
    })

    it('should render grid container', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.grid').exists()).toBe(true)
    })

    it('should show no horses when horses array is empty', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      const cards = wrapper.findAll('.card')
      expect(cards).toHaveLength(0)
    })

    it('should render horse cards when horses exist', () => {
      const mockHorses = [
        { id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 },
        { id: 2, name: 'Horse #2', color: '#3cb44b', condition: 90 },
        { id: 3, name: 'Horse #3', color: '#ffe119', condition: 75 }
      ]
      
      store = createMockStore({ horses: mockHorses })
      wrapper = mountComponent(store)
      
      const cards = wrapper.findAll('.card')
      expect(cards).toHaveLength(3)
    })
  })

  describe('Horse Card Rendering', () => {
    const mockHorses = [
      { id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 },
      { id: 2, name: 'Horse #2', color: '#3cb44b', condition: 90 }
    ]

    beforeEach(() => {
      store = createMockStore({ horses: mockHorses })
      wrapper = mountComponent(store)
    })

    it('should render horse swatch with correct color', () => {
      const firstCard = wrapper.find('.card')
      expect(firstCard.exists()).toBe(true)
      
      const swatch = firstCard.find('.swatch')
      expect(swatch.attributes('style')).toContain('background-color: rgb(230, 25, 75)')
    })

    it('should render horse name with correct color', () => {
      const firstCard = wrapper.find('.card')
      expect(firstCard.exists()).toBe(true)
      
      const name = firstCard.find('.name')
      expect(name.text()).toBe('Horse #1')
      expect(name.attributes('style')).toContain('color: rgb(230, 25, 75)')
    })

    it('should render horse condition', () => {
      const cards = wrapper.findAll('.card')
      const firstCard = cards[0]
      
      const meta = firstCard.find('.meta')
      expect(meta.text()).toBe('Condition: 80')
    })

    it('should render all horse properties correctly', () => {
      const cards = wrapper.findAll('.card')
      
      cards.forEach((card, index) => {
        const horse = mockHorses[index]
        
        // Check swatch color
        const swatch = card.find('.swatch')
        expect(swatch.attributes('style')).toContain(`background-color: ${hexToRgb(horse.color)}`)
        
        // Check name
        const name = card.find('.name')
        expect(name.text()).toBe(horse.name)
        expect(name.attributes('style')).toContain(`color: ${hexToRgb(horse.color)}`)
        
        // Check condition
        const meta = card.find('.meta')
        expect(meta.text()).toBe(`Condition: ${horse.condition}`)
      })
    })
  })

  describe('Computed Properties', () => {
    it('should map horses from store state', () => {
      const mockHorses = [
        { id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 }
      ]
      
      store = createMockStore({ horses: mockHorses })
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.horses).toEqual(mockHorses)
    })

    it('should update when store state changes', async () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.vm.horses).toEqual([])
      
      const newHorses = [
        { id: 1, name: 'New Horse', color: '#ff0000', condition: 95 }
      ]
      
      store.state.horses = newHorses
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.horses).toEqual(newHorses)
    })
  })

  describe('CSS Classes and Styling', () => {
    it('should apply grid layout class', () => {
      store = createMockStore()
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.grid').classes()).toContain('grid')
    })

    it('should apply card styling class', () => {
      const mockHorses = [{ id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 }]
      store = createMockStore({ horses: mockHorses })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.card').classes()).toContain('card')
    })

    it('should apply swatch styling class', () => {
      const mockHorses = [{ id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 }]
      store = createMockStore({ horses: mockHorses })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.swatch').classes()).toContain('swatch')
    })

    it('should apply info styling classes', () => {
      const mockHorses = [{ id: 1, name: 'Horse #1', color: '#e6194b', condition: 80 }]
      store = createMockStore({ horses: mockHorses })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.info').classes()).toContain('info')
      expect(wrapper.find('.name').classes()).toContain('name')
      expect(wrapper.find('.meta').classes()).toContain('meta')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty horses array gracefully', () => {
      store = createMockStore({ horses: [] })
      wrapper = mountComponent(store)
      
      expect(wrapper.find('.grid').exists()).toBe(true)
      expect(wrapper.findAll('.card')).toHaveLength(0)
    })

    it('should handle large number of horses', () => {
      const manyHorses = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Horse #${i + 1}`,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        condition: Math.floor(Math.random() * 100) + 1
      }))
      
      store = createMockStore({ horses: manyHorses })
      wrapper = mountComponent(store)
      
      const cards = wrapper.findAll('.card')
      expect(cards).toHaveLength(100)
    })

    it('should handle horses with missing properties gracefully', () => {
      const incompleteHorses = [
        { id: 1, name: 'Horse #1' }, // missing color and condition
        { id: 2, color: '#e6194b' }, // missing name and condition
        { id: 3, condition: 80 } // missing name and color
      ]
      
      store = createMockStore({ horses: incompleteHorses })
      wrapper = mountComponent(store)
      
      const cards = wrapper.findAll('.card')
      expect(cards).toHaveLength(3)
      
      // Should not crash even with missing properties
      expect(wrapper.find('.grid').exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    it('should have correct component name', () => {
      expect(HorseList.name).toBe('HorseList')
    })

    it('should use mapState for horses', () => {
      expect(HorseList.computed).toHaveProperty('horses')
    })

    it('should not have any methods', () => {
      expect(HorseList.methods).toBeUndefined()
    })

    it('should not have any props', () => {
      expect(HorseList.props).toBeUndefined()
    })
  })
})
