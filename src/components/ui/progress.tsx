import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn, construction, a11y } from "@/lib/utils"

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /**
   * Progress value (0-100)
   */
  value?: number
  /**
   * Construction context for semantic coloring
   */
  constructionType?: "project" | "task" | "budget" | "timeline" | "inspection"
  /**
   * Show percentage text
   */
  showValue?: boolean
  /**
   * Progress label for accessibility
   */
  label?: string
  /**
   * Size variant
   */
  size?: "sm" | "default" | "lg"
  /**
   * Mobile-optimized variant
   */
  mobile?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  constructionType,
  showValue = false,
  label,
  size = "default",
  mobile = false,
  ...props 
}, ref) => {
  const progressId = a11y.generateId('progress')
  const labelId = label ? a11y.generateId('progress-label') : undefined

  // Construction-specific colors based on progress
  const getProgressColor = React.useCallback((value: number, type?: string) => {
    if (type === "budget") {
      if (value > 90) return "bg-red-500" // Over budget
      if (value > 80) return "bg-orange-500" // Warning
      return "bg-green-500" // On track
    }
    
    if (type === "timeline") {
      if (value < 50) return "bg-blue-500" // Early stages
      if (value < 80) return "bg-green-500" // On track
      return "bg-orange-500" // Near completion
    }
    
    if (type === "inspection") {
      return value === 100 ? "bg-green-500" : "bg-blue-500"
    }
    
    // Default construction progress colors
    if (value === 100) return "bg-construction-green"
    if (value > 75) return "bg-construction-blue"
    if (value > 50) return "bg-construction-orange"
    return "bg-construction-yellow"
  }, [])

  const sizeClasses = {
    sm: "h-2",
    default: "h-4",
    lg: "h-6"
  }

  const progressColor = getProgressColor(value, constructionType)
  
  // Accessible announcement for progress changes
  React.useEffect(() => {
    if (label && value > 0) {
      const message = `${label}: ${value}% complete`
      a11y.announce(message, 'polite')
    }
  }, [value, label])

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label 
            id={labelId}
            className={cn(
              "text-sm font-medium text-foreground",
              mobile && "text-base"
            )}
          >
            {label}
          </label>
          {showValue && (
            <span 
              className={cn(
                "text-sm font-medium text-muted-foreground",
                mobile && "text-base"
              )}
              aria-label={`${value} percent complete`}
            >
              {value}%
            </span>
          )}
        </div>
      )}
      
      <ProgressPrimitive.Root
        ref={ref}
        id={progressId}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          sizeClasses[size],
          mobile && "h-6", // Override for mobile
          className
        )}
        aria-labelledby={labelId}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-in-out",
            progressColor
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
        
        {/* Screen reader text */}
        <span className="sr-only">
          {construction.phases.getPhaseLabel(constructionType || 'PROJECT')} progress: {value}% complete
        </span>
      </ProgressPrimitive.Root>
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }