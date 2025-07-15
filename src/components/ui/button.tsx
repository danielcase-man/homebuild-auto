import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Construction-specific variants
        construction: "bg-construction-blue text-white hover:bg-blue-700 shadow-sm",
        warning: "bg-construction-orange text-white hover:bg-orange-700 shadow-sm",
        success: "bg-construction-green text-white hover:bg-green-700 shadow-sm",
        danger: "bg-construction-red text-white hover:bg-red-700 shadow-sm",
        // Mobile-optimized variants
        mobile: "bg-construction-blue text-white hover:bg-blue-700 shadow-lg min-h-[44px] text-base font-semibold",
        "mobile-outline": "border-2 border-construction-blue text-construction-blue hover:bg-construction-blue hover:text-white min-h-[44px] text-base font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        // Mobile-optimized sizes
        mobile: "h-12 px-6 py-3 text-base min-w-[120px]",
        "mobile-icon": "h-12 w-12",
        // Field worker optimized
        field: "h-14 px-8 py-4 text-lg font-bold min-w-[140px] shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Screen reader label for accessibility
   */
  ariaLabel?: string
  /**
   * Loading state with accessible announcement
   */
  loading?: boolean
  /**
   * Icon position for construction buttons
   */
  iconPosition?: "left" | "right"
  /**
   * Construction context for semantic meaning
   */
  constructionRole?: "primary" | "secondary" | "emergency" | "approval"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    ariaLabel,
    loading = false,
    disabled,
    children,
    constructionRole,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Determine variant based on construction role
    const finalVariant = React.useMemo(() => {
      if (variant) return variant
      
      switch (constructionRole) {
        case "primary":
          return "construction"
        case "emergency":
          return "danger"
        case "approval":
          return "success"
        case "secondary":
        default:
          return "outline"
      }
    }, [variant, constructionRole])

    // Accessibility enhancements
    const accessibilityProps = React.useMemo(() => {
      const props: Record<string, any> = {}
      
      if (ariaLabel) {
        props['aria-label'] = ariaLabel
      }
      
      if (loading) {
        props['aria-busy'] = true
        props['aria-label'] = `${ariaLabel || 'Button'} loading`
      }
      
      if (disabled || loading) {
        props['aria-disabled'] = true
      }

      return props
    }, [ariaLabel, loading, disabled])

    return (
      <Comp
        className={cn(buttonVariants({ variant: finalVariant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...accessibilityProps}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Loading"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }