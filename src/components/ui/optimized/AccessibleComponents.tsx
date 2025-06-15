import React, { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

// Skip to content link for keyboard navigation
export const SkipToContent = ({ contentId = 'main-content' }: { contentId?: string }) => (
  <a
    href={`#${contentId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 
               focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
               focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
  >
    Skip to main content
  </a>
)

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  loading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  label,
  loading = false,
  loadingText = 'Loading...',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}, ref) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      ref={ref}
      aria-label={label}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-md font-medium 
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="sr-only">{loadingText}</span>
          {children || label}
        </>
      ) : (
        children || label
      )}
    </button>
  )
})

AccessibleButton.displayName = 'AccessibleButton'

// Focus trap hook for modals and dialogs
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first element
    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown as any)
    return () => container.removeEventListener('keydown', handleKeyDown as any)
  }, [isActive])

  return containerRef
}

// Accessible modal/dialog component
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  size = 'md'
}: AccessibleModalProps) => {
  const focusTrapRef = useFocusTrap(isOpen)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Store and restore focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
    } else {
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape as any)
    return () => document.removeEventListener('keydown', handleEscape as any)
  }, [isOpen, closeOnEscape, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={focusTrapRef}
        className={`relative bg-background rounded-lg shadow-lg p-6 m-4 ${sizeClasses[size]} w-full`}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <p id="modal-description" className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-accent"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Accessible form field with proper labeling
interface AccessibleFieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactElement
}

export const AccessibleField = ({
  label,
  error,
  required,
  hint,
  children
}: AccessibleFieldProps) => {
  const inputId = React.useId()
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const childWithProps = React.cloneElement(children, {
    id: inputId,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': [
      error && errorId,
      hint && hintId
    ].filter(Boolean).join(' ') || undefined
  })

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </label>
      
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      
      {childWithProps}
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible toggle/switch component
interface AccessibleToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

export const AccessibleToggle = ({
  checked,
  onChange,
  label,
  disabled = false
}: AccessibleToggleProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange(!checked)
    }
  }

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-primary' : 'bg-input'}
      `}
    >
      <span className="sr-only">{label}</span>
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-background transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

// Live region for announcements
export const LiveRegion = ({ 
  message, 
  politeness = 'polite' 
}: { 
  message: string
  politeness?: 'polite' | 'assertive' 
}) => {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Accessible data table with proper ARIA
interface AccessibleTableProps<T> {
  data: T[]
  columns: {
    key: keyof T
    header: string
    render?: (value: T[keyof T], item: T) => React.ReactNode
  }[]
  caption?: string
  rowKey: (item: T) => string | number
}

export const AccessibleTable = <T,>({
  data,
  columns,
  caption,
  rowKey
}: AccessibleTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        {caption && (
          <caption className="text-sm text-muted-foreground py-2">
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map(item => (
            <tr key={rowKey(item)}>
              {columns.map(column => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm"
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}