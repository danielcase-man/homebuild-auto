import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, a11y, construction } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface ProjectButtonProps extends Omit<ButtonProps, 'children'> {
  /**
   * Project name
   */
  title: string
  /**
   * Project description
   */
  description?: string
  /**
   * Project status
   */
  status?: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "DELAYED" | "ON_HOLD"
  /**
   * Project progress percentage
   */
  progress?: number
  /**
   * Budget information
   */
  budget?: {
    spent: number
    total: number
  }
  /**
   * Project icon
   */
  icon?: LucideIcon
  /**
   * Project image/thumbnail
   */
  image?: string
  /**
   * Compact layout for mobile
   */
  compact?: boolean
  /**
   * Show progress bar
   */
  showProgress?: boolean
  /**
   * Show budget info
   */
  showBudget?: boolean
  /**
   * Field worker optimized (larger touch targets)
   */
  fieldOptimized?: boolean
  /**
   * High contrast mode for outdoor visibility
   */
  highContrast?: boolean
}

const ProjectButton = React.forwardRef<HTMLButtonElement, ProjectButtonProps>(
  ({
    title,
    description,
    status,
    progress = 0,
    budget,
    icon: Icon,
    image,
    compact = false,
    showProgress = true,
    showBudget = false,
    fieldOptimized = false,
    highContrast = false,
    className,
    ...props
  }, ref) => {
    const buttonId = a11y.generateId('project-button')
    
    // Determine button variant based on context
    const buttonVariant = React.useMemo(() => {
      if (props.variant) return props.variant
      if (fieldOptimized) return "mobile"
      return "outline"
    }, [props.variant, fieldOptimized])

    // Determine button size
    const buttonSize = React.useMemo(() => {
      if (props.size) return props.size
      if (fieldOptimized) return "field"
      if (compact) return "default"
      return "lg"
    }, [props.size, fieldOptimized, compact])

    // Accessibility label
    const accessibilityLabel = React.useMemo(() => {
      let label = `Project: ${title}`
      if (status) label += `, Status: ${a11y.formatStatus(status)}`
      if (progress) label += `, ${progress}% complete`
      if (budget) {
        const budgetPercent = construction.calculateProgress(budget.spent, budget.total)
        label += `, Budget: ${budgetPercent}% used`
      }
      return label
    }, [title, status, progress, budget])

    return (
      <Button
        ref={ref}
        id={buttonId}
        variant={buttonVariant}
        size={buttonSize}
        ariaLabel={accessibilityLabel}
        className={cn(
          "relative overflow-hidden text-left justify-start p-0",
          // Layout adjustments
          compact ? "h-auto min-h-[60px]" : "h-auto min-h-[100px]",
          fieldOptimized && "min-h-[120px] shadow-xl",
          highContrast && "border-2 font-bold",
          className
        )}
        {...props}
      >
        <div className={cn(
          "flex w-full",
          compact ? "p-3" : "p-4",
          fieldOptimized && "p-6"
        )}>
          {/* Icon or Image */}
          <div className={cn(
            "flex-shrink-0",
            compact ? "mr-3" : "mr-4"
          )}>
            {image ? (
              <div className={cn(
                "rounded-md bg-muted overflow-hidden",
                compact ? "h-12 w-12" : "h-16 w-16",
                fieldOptimized && "h-20 w-20"
              )}>
                <img 
                  src={image} 
                  alt={`${title} project thumbnail`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : Icon ? (
              <div className={cn(
                "rounded-md bg-construction-blue/10 flex items-center justify-center",
                compact ? "h-12 w-12" : "h-16 w-16",
                fieldOptimized && "h-20 w-20"
              )}>
                <Icon 
                  className={cn(
                    "text-construction-blue",
                    compact ? "h-6 w-6" : "h-8 w-8",
                    fieldOptimized && "h-10 w-10"
                  )}
                  aria-hidden="true"
                />
              </div>
            ) : (
              <div className={cn(
                "rounded-md bg-muted flex items-center justify-center",
                compact ? "h-12 w-12" : "h-16 w-16",
                fieldOptimized && "h-20 w-20"
              )}>
                <span className={cn(
                  "font-bold text-muted-foreground",
                  compact ? "text-lg" : "text-xl",
                  fieldOptimized && "text-2xl"
                )}>
                  {title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className={cn(
                "font-semibold text-foreground truncate",
                compact ? "text-sm" : "text-base",
                fieldOptimized && "text-lg",
                highContrast && "font-bold"
              )}>
                {title}
              </h3>
              
              {status && (
                <Badge 
                  status={status}
                  size={compact ? "sm" : "default"}
                  highContrast={highContrast}
                  className="ml-2 flex-shrink-0"
                />
              )}
            </div>

            {description && !compact && (
              <p className={cn(
                "text-muted-foreground text-sm mb-2 line-clamp-2",
                fieldOptimized && "text-base"
              )}>
                {description}
              </p>
            )}

            {/* Progress Bar */}
            {showProgress && progress > 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-xs text-muted-foreground",
                    fieldOptimized && "text-sm"
                  )}>
                    Progress
                  </span>
                  <span className={cn(
                    "text-xs font-medium",
                    fieldOptimized && "text-sm"
                  )}>
                    {progress}%
                  </span>
                </div>
                <div className={cn(
                  "w-full bg-muted rounded-full",
                  compact ? "h-1" : "h-2"
                )}>
                  <div
                    className="bg-construction-blue h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Project progress: ${progress}% complete`}
                  />
                </div>
              </div>
            )}

            {/* Budget Info */}
            {showBudget && budget && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Budget</span>
                <span className={cn(
                  budget.spent > budget.total ? "text-red-600 font-semibold" : "",
                  fieldOptimized && "text-sm"
                )}>
                  {construction.formatCurrency(budget.spent)} / {construction.formatCurrency(budget.total)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status indicator line */}
        {status && (
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1",
              status === "COMPLETED" && "bg-construction-green",
              status === "IN_PROGRESS" && "bg-construction-blue", 
              status === "PENDING" && "bg-construction-yellow",
              status === "DELAYED" && "bg-construction-red",
              status === "ON_HOLD" && "bg-construction-slate"
            )}
            aria-hidden="true"
          />
        )}
      </Button>
    )
  }
)
ProjectButton.displayName = "ProjectButton"

export { ProjectButton }