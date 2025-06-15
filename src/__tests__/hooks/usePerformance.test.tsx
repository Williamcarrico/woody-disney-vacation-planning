import { renderHook, act } from '@testing-library/react'
import { 
  useRenderPerformance, 
  useDebounce, 
  useThrottle,
  useVisibilityOptimization 
} from '@/hooks/usePerformance'

// Mock performance monitor
jest.mock('@/lib/firebase/firebase-performance', () => ({
  performanceMonitor: {
    recordOperation: jest.fn(),
  },
}))

describe('useRenderPerformance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('tracks render count', () => {
    const { result, rerender } = renderHook(() => 
      useRenderPerformance('TestComponent')
    )

    expect(result.current.renderCount).toBe(1)

    rerender()
    expect(result.current.renderCount).toBe(2)

    rerender()
    expect(result.current.renderCount).toBe(3)
  })

  it('calculates average render time', () => {
    const { result, rerender } = renderHook(() => 
      useRenderPerformance('TestComponent')
    )

    // Initial render
    expect(result.current.averageRenderTime).toBeGreaterThanOrEqual(0)

    // Multiple renders
    rerender()
    rerender()
    
    expect(result.current.averageRenderTime).toBeGreaterThanOrEqual(0)
    expect(result.current.lastRenderTime).toBeGreaterThanOrEqual(0)
  })
})

describe('useDebounce', () => {
  jest.useFakeTimers()

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial') // Still initial

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial') // Still initial

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated') // Now updated
  })

  it('cancels previous timers on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    )

    rerender({ value: 'second' })
    act(() => {
      jest.advanceTimersByTime(100)
    })

    rerender({ value: 'third' })
    act(() => {
      jest.advanceTimersByTime(100)
    })

    rerender({ value: 'fourth' })
    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(result.current).toBe('fourth')
  })
})

describe('useThrottle', () => {
  jest.useFakeTimers()

  it('throttles value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 1 } }
    )

    expect(result.current).toBe(1)

    // Rapid updates
    rerender({ value: 2 })
    rerender({ value: 3 })
    rerender({ value: 4 })

    // Value should not update immediately
    expect(result.current).toBe(1)

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Should have the latest value
    expect(result.current).toBe(4)
  })
})

describe('useVisibilityOptimization', () => {
  let mockIntersectionObserver: jest.Mock

  beforeEach(() => {
    mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    })
    global.IntersectionObserver = mockIntersectionObserver as any
  })

  it('tracks element visibility', () => {
    const { result } = renderHook(() => useVisibilityOptimization())

    expect(result.current.isVisible).toBe(false)
    expect(result.current.hasBeenVisible).toBe(false)
    expect(result.current.shouldRender).toBe(false)
  })

  it('creates intersection observer with element', () => {
    const { result } = renderHook(() => useVisibilityOptimization())

    // Create a mock element
    const element = document.createElement('div')
    
    // Simulate ref assignment
    act(() => {
      Object.defineProperty(result.current.ref, 'current', {
        writable: true,
        value: element,
      })
    })

    // Re-render to trigger effect
    const { rerender } = renderHook(() => useVisibilityOptimization())
    rerender()

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.1,
        rootMargin: '50px',
      })
    )
  })

  it('updates visibility when intersection changes', () => {
    let intersectionCallback: IntersectionObserverCallback

    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback
      return {
        observe: jest.fn(),
        disconnect: jest.fn(),
        unobserve: jest.fn(),
      }
    })

    const { result } = renderHook(() => useVisibilityOptimization())

    // Simulate element becoming visible
    act(() => {
      intersectionCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current.isVisible).toBe(true)
    expect(result.current.hasBeenVisible).toBe(true)
    expect(result.current.shouldRender).toBe(true)

    // Simulate element becoming invisible
    act(() => {
      intersectionCallback!(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current.isVisible).toBe(false)
    expect(result.current.hasBeenVisible).toBe(true) // Still true
    expect(result.current.shouldRender).toBe(true) // Still true
  })
})