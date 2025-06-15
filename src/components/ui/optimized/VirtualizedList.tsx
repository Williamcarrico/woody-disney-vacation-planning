import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useInView } from 'react-intersection-observer'

interface VirtualizedListProps<T> {
  items: T[]
  height: number | string
  itemHeight: number | ((index: number) => number)
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
  onEndReached?: () => void
  endReachedThreshold?: number
  emptyState?: React.ReactNode
  loadingState?: React.ReactNode
  isLoading?: boolean
  estimatedItemHeight?: number
}

interface ItemPosition {
  index: number
  offset: number
  height: number
}

export const VirtualizedList = <T,>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  onEndReached,
  endReachedThreshold = 0.8,
  emptyState,
  loadingState,
  isLoading = false,
  estimatedItemHeight = 50
}: VirtualizedListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(
    typeof height === 'number' ? height : 0
  )

  // Calculate item positions
  const itemPositions = useMemo(() => {
    const positions: ItemPosition[] = []
    let offset = 0

    for (let i = 0; i < items.length; i++) {
      const h = typeof itemHeight === 'function' ? itemHeight(i) : itemHeight
      positions.push({
        index: i,
        offset,
        height: h
      })
      offset += h
    }

    return positions
  }, [items, itemHeight])

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (itemPositions.length === 0) return 0
    const lastItem = itemPositions[itemPositions.length - 1]
    return lastItem.offset + lastItem.height
  }, [itemPositions])

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = scrollTop
    const end = scrollTop + containerHeight

    let startIndex = 0
    let endIndex = items.length - 1

    // Binary search for start index
    let low = 0
    let high = itemPositions.length - 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const pos = itemPositions[mid]
      
      if (pos.offset + pos.height < start) {
        low = mid + 1
      } else if (pos.offset > start) {
        high = mid - 1
      } else {
        startIndex = mid
        break
      }
    }
    startIndex = Math.max(0, low - overscan)

    // Binary search for end index
    low = startIndex
    high = itemPositions.length - 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const pos = itemPositions[mid]
      
      if (pos.offset < end) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    endIndex = Math.min(items.length - 1, high + overscan)

    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, itemPositions, items.length, overscan])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop: newScrollTop, scrollHeight, clientHeight } = e.currentTarget
    setScrollTop(newScrollTop)

    // Check if end reached
    if (onEndReached) {
      const scrollPercentage = (newScrollTop + clientHeight) / scrollHeight
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached()
      }
    }
  }, [onEndReached, endReachedThreshold])

  // Handle resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current && typeof height === 'string') {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [height])

  // Render visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    const elements: React.ReactNode[] = []

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i]
      const position = itemPositions[i]
      if (!item || !position) continue

      elements.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: position.offset,
            left: 0,
            right: 0,
            height: position.height
          }}
        >
          {renderItem(item, i)}
        </div>
      )
    }

    return elements
  }, [visibleRange, items, itemPositions, renderItem])

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        {emptyState || <p className="text-muted-foreground">No items to display</p>}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
      
      {isLoading && loadingState && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur">
          {loadingState}
        </div>
      )}
    </div>
  )
}

// Memoized version for better performance
export const MemoizedVirtualizedList = memo(VirtualizedList) as typeof VirtualizedList

// Hook for infinite scroll with virtualized list
export const useInfiniteVirtualScroll = <T,>({
  loadMore,
  hasMore,
  threshold = 0.8
}: {
  loadMore: () => Promise<void>
  hasMore: boolean
  threshold?: number
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleEndReached = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      await loadMore()
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, loadMore])

  return {
    isLoading,
    handleEndReached,
    endReachedThreshold: threshold
  }
}

// Simple virtualized grid component
interface VirtualizedGridProps<T> {
  items: T[]
  columns: number
  rowHeight: number
  height: number | string
  renderItem: (item: T, index: number) => React.ReactNode
  gap?: number
  className?: string
}

export const VirtualizedGrid = <T,>({
  items,
  columns,
  rowHeight,
  height,
  renderItem,
  gap = 16,
  className = ''
}: VirtualizedGridProps<T>) => {
  // Group items into rows
  const rows = useMemo(() => {
    const result: T[][] = []
    for (let i = 0; i < items.length; i += columns) {
      result.push(items.slice(i, i + columns))
    }
    return result
  }, [items, columns])

  return (
    <VirtualizedList
      items={rows}
      height={height}
      itemHeight={rowHeight}
      className={className}
      renderItem={(row, rowIndex) => (
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`
          }}
        >
          {row.map((item, colIndex) => {
            const itemIndex = rowIndex * columns + colIndex
            return (
              <div key={itemIndex}>
                {renderItem(item, itemIndex)}
              </div>
            )
          })}
        </div>
      )}
    />
  )
}