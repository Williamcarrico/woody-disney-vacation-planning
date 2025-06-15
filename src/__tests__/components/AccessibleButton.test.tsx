import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AccessibleButton } from '@/components/ui/optimized/AccessibleComponents'

describe('AccessibleButton', () => {
  it('renders with label', () => {
    render(<AccessibleButton label="Click me" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Click me')
  })

  it('shows loading state', () => {
    render(<AccessibleButton label="Submit" loading loadingText="Submitting..." />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Submit')).toBeInTheDocument()
    expect(screen.getByText('Submitting...')).toHaveClass('sr-only')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<AccessibleButton label="Click me" onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    const { rerender } = render(<AccessibleButton label="Button" variant="primary" />)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
    
    rerender(<AccessibleButton label="Button" variant="secondary" />)
    expect(screen.getByRole('button')).toHaveClass('bg-secondary')
    
    rerender(<AccessibleButton label="Button" variant="ghost" />)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
  })

  it('applies size classes', () => {
    const { rerender } = render(<AccessibleButton label="Button" size="sm" />)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')
    
    rerender(<AccessibleButton label="Button" size="md" />)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2')
    
    rerender(<AccessibleButton label="Button" size="lg" />)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('disables button when disabled prop is true', () => {
    render(<AccessibleButton label="Disabled" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('prevents click when loading', () => {
    const handleClick = jest.fn()
    render(<AccessibleButton label="Submit" loading onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})