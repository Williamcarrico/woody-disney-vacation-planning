'use client'

import { useState, useCallback, memo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchResult {
  id: string
  title: string
  type: 'park' | 'attraction' | 'restaurant' | 'resort' | 'page'
  description?: string
  url: string
}

interface SearchBarProps {
  onSearch?: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  className?: string
}

const SearchBar = memo(function SearchBar({ 
  onSearch, 
  onResultSelect, 
  className 
}: SearchBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Mock search function - replace with actual search logic
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock results - replace with actual search API
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'Magic Kingdom',
        type: 'park',
        description: 'The most magical place on earth',
        url: '/dashboard/parks/magic-kingdom'
      },
      {
        id: '2',
        title: 'Space Mountain',
        type: 'attraction',
        description: 'Thrilling indoor roller coaster',
        url: '/dashboard/attractions/space-mountain'
      },
      {
        id: '3',
        title: 'Be Our Guest Restaurant',
        type: 'restaurant',
        description: 'Enchanted dining experience',
        url: '/dashboard/dining/be-our-guest'
      }
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description?.toLowerCase().includes(query.toLowerCase())
    )

    setSearchResults(mockResults)
    setIsSearching(false)
  }, [])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }, [searchQuery, onSearch])

  const handleResultClick = useCallback((result: SearchResult) => {
    onResultSelect?.(result)
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }, [onResultSelect])

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(prev => !prev)
    if (!isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isSearchOpen])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  // Close search on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  return (
    <div className={`relative ${className}`}>
      {/* Search Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSearchToggle}
        className="relative"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search parks, attractions, restaurants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                  {isSearching && (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  )}

                  {!isSearching && searchQuery && searchResults.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {result.type === 'park' && <span className="text-red-500">🏰</span>}
                              {result.type === 'attraction' && <span className="text-blue-500">🎢</span>}
                              {result.type === 'restaurant' && <span className="text-green-500">🍽️</span>}
                              {result.type === 'resort' && <span className="text-purple-500">🏨</span>}
                              {result.type === 'page' && <span className="text-gray-500">📄</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </h3>
                              {result.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                  {result.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!searchQuery && (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Start typing to search for parks, attractions, and more...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

SearchBar.displayName = "SearchBar"

export default SearchBar
export type { SearchResult }