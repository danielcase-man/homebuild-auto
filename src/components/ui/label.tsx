import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        error: "text-destructive",
        success: "text-green-600",
        warning: "text-orange-600",
        // Construction-specific variants
        construction: "text-construction-blue font-semibold",
        field: "text-sm font-bold text-construction-slate bg-white px-2 py-1 rounded shadow-sm",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
        // Mobile-optimized sizes
        mobile: "text-base font-medium",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /**
   * Whether this field is required
   */
  required?: boolean
  /**
   * Additional help text for the field
   */
  helpText?: string
  /**
   * Error state
   */
  error?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, required, helpText, error, children, ...props }, ref) => {
  const finalVariant = error ? "error" : variant

  return (
    <div className="space-y-1">
      <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants({ variant: finalVariant, size }), className)}
        {...props}
      >
        {children}
        {required && (
          <span 
            className="text-destructive ml-1" 
            aria-label="required field"
            title="This field is required"
          >
            *
          </span>
        )}
      </LabelPrimitive.Root>
      {helpText && (
        <p className="text-xs text-muted-foreground mt-1">
          {helpText}
        </p>
      )}
    </div>
  )
})
Label.displayName = LabelPrimitive.Root.displayName

export { Label }