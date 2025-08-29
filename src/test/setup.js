import { vi } from 'vitest'

// Mock performance.now for consistent testing
global.performance = {
  now: vi.fn(() => 1000)
}

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
