import * as React from "react"
import { cn, a11y } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Error state for accessibility and validation
   */
  error?: boolean
  /**
   * Error message for screen readers
   */
  errorMessage?: string
  /**
   * Field label for accessibility
   */
  label?: string
  /**
   * Helper text for field guidance
   */
  helperText?: string
  /**
   * Construction field type for specialized validation
   */
  constructionType?: "budget" | "measurement" | "address" | "phone" | "email" | "permit"
  /**
   * Required field indicator
   */
  required?: boolean
  /**
   * Mobile-optimized variant
   */
  mobile?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error, 
    errorMessage, 
    label, 
    helperText, 
    constructionType,
    required,
    mobile,
    id,
    ...props 
  }, ref) => {
    const fieldId = id || a11y.generateId('input')
    const errorId = error ? a11y.generateId('error') : undefined
    const helperId = helperText ? a11y.generateId('helper') : undefined

    // Construction-specific input formatting
    const formatConstructionValue = React.useCallback((value: string) => {
      switch (constructionType) {
        case 'budget':
          // Format as currency
          const num = value.replace(/[^\d]/g, '')
          if (num) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(parseInt(num))
          }
          return value
        case 'measurement':
          // Allow decimal numbers with units
          return value.replace(/[^\d.-]/g, '')
        case 'phone':
          // Format phone number
          const cleaned = value.replace(/\D/g, '')
          if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
          }
          return value
        default:
          return value
      }
    }, [constructionType])

    // Input type based on construction type
    const inputType = React.useMemo(() => {
      if (type) return type
      
      switch (constructionType) {
        case 'budget':
        case 'measurement':
          return 'text' // We'll handle formatting manually
        case 'email':
          return 'email'
        case 'phone':
          return 'tel'
        default:
          return 'text'
      }
    }, [type, constructionType])

    // Input mode for mobile keyboards
    const inputMode = React.useMemo(() => {
      switch (constructionType) {
        case 'budget':
        case 'measurement':
          return 'numeric'
        case 'phone':
          return 'tel'
        case 'email':
          return 'email'
        default:
          return undefined
      }
    }, [constructionType])

    const accessibilityProps = React.useMemo(() => {
      const props: Record<string, any> = {}
      
      if (errorId) {
        props['aria-describedby'] = [errorId, helperId].filter(Boolean).join(' ')
        props['aria-invalid'] = true
      } else if (helperId) {
        props['aria-describedby'] = helperId
      }
      
      if (required) {
        props['aria-required'] = true
      }

      if (label) {
        props['aria-label'] = label
      }

      return props
    }, [errorId, helperId, required, label])

    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={fieldId} 
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error ? "text-destructive" : "text-foreground"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <input
          type={inputType}
          inputMode={inputMode}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            // Mobile optimizations
            mobile && "h-12 text-base",
            // Error styling
            error && "border-destructive focus-visible:ring-destructive",
            // Construction type styling
            constructionType === 'budget' && "font-mono",
            constructionType === 'measurement' && "font-mono",
            className
          )}
          id={fieldId}
          ref={ref}
          {...accessibilityProps}
          {...props}
        />
        
        {helperText && !error && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
        
        {error && errorMessage && (
          <p 
            id={errorId} 
            className="text-xs text-destructive"
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }