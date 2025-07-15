import * as React from "react"
import { cn, a11y, construction } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Pause, 
  Play,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"

export interface StatusIndicatorProps {
  /**
   * Current status
   */
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "DELAYED" | "ON_HOLD" | "CANCELLED"
  /**
   * Progress percentage (0-100)
   */
  progress?: number
  /**
   * Status label override
   */
  label?: string
  /**
   * Size variant
   */
  size?: "sm" | "default" | "lg"
  /**
   * Show progress bar
   */
  showProgress?: boolean
  /**
   * Show status icon
   */
  showIcon?: boolean
  /**
   * Show trend indicator
   */
  showTrend?: boolean
  /**
   * Trend direction
   */
  trend?: "up" | "down" | "stable"
  /**
   * High contrast mode for outdoor visibility
   */
  highContrast?: boolean
  /**
   * Mobile optimized
   */
  mobile?: boolean
  /**
   * Field optimized for outdoor use
   */
  fieldOptimized?: boolean
  /**
   * Layout variant
   */
  variant?: "badge" | "card" | "inline" | "compact"
  /**
   * Show last updated time
   */
  lastUpdated?: Date
  /**
   * Additional context information
   */
  context?: string
  /**
   * Click handler for interactive indicators
   */
  onClick?: () => void
  /**
   * Accessibility label override
   */
  ariaLabel?: string
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  progress,
  label,
  size = "default",
  showProgress = false,
  showIcon = true,
  showTrend = false,
  trend = "stable",
  highContrast = false,
  mobile = false,
  fieldOptimized = false,
  variant = "badge",
  lastUpdated,
  context,
  onClick,
  ariaLabel
}) => {
  const indicatorId = a11y.generateId('status-indicator')
  
  // Status configuration
  const statusConfig = React.useMemo(() => {
    const configs = {
      COMPLETED: {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        label: "Completed",
        description: "Task has been completed successfully"
      },
      IN_PROGRESS: {
        icon: Activity,
        color: "text-blue-600", 
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: "In Progress",
        description: "Task is currently being worked on"
      },
      PENDING: {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50", 
        borderColor: "border-yellow-200",
        label: "Pending",
        description: "Task is waiting to be started"
      },
      DELAYED: {
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200", 
        label: "Delayed",
        description: "Task is behind schedule"
      },
      ON_HOLD: {
        icon: Pause,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        label: "On Hold", 
        description: "Task has been temporarily paused"
      },
      CANCELLED: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        label: "Cancelled",
        description: "Task has been cancelled"
      }
    }
    
    return configs[status]
  }, [status])

  // Trend icon
  const TrendIcon = React.useMemo(() => {
    switch (trend) {
      case "up":
        return TrendingUp
      case "down": 
        return TrendingDown
      default:
        return null
    }
  }, [trend])

  // Accessibility label
  const accessibilityLabel = React.useMemo(() => {
    if (ariaLabel) return ariaLabel
    
    let label = `Status: ${statusConfig.label}`
    if (progress !== undefined) label += `, ${progress}% complete`
    if (context) label += `, ${context}`
    if (lastUpdated) {
      label += `, last updated ${lastUpdated.toLocaleDateString()}`
    }
    
    return label
  }, [ariaLabel, statusConfig.label, progress, context, lastUpdated])

  // Size classes
  const sizeClasses = React.useMemo(() => {
    const sizes = {
      sm: {
        container: "text-xs",
        icon: "h-3 w-3",
        padding: "p-1"
      },
      default: {
        container: "text-sm",
        icon: "h-4 w-4", 
        padding: "p-2"
      },
      lg: {
        container: "text-base",
        icon: "h-5 w-5",
        padding: "p-3"
      }
    }
    
    if (fieldOptimized) {
      return {
        container: "text-lg font-bold",
        icon: "h-6 w-6",
        padding: "p-4"
      }
    }
    
    if (mobile) {
      return {
        container: "text-base",
        icon: "h-5 w-5",
        padding: "p-3"
      }
    }
    
    return sizes[size]
  }, [size, fieldOptimized, mobile])

  // Render based on variant
  const renderContent = () => {
    const Icon = statusConfig.icon
    const displayLabel = label || statusConfig.label
    
    switch (variant) {
      case "badge":
        return (
          <Badge
            status={status}
            size={mobile ? "mobile" : size}
            highContrast={highContrast}
            interactive={!!onClick}
            icon={showIcon ? <Icon className={sizeClasses.icon} /> : undefined}
            ariaLabel={accessibilityLabel}
            onClick={onClick}
            role={onClick ? "button" : "status"}
            tabIndex={onClick ? 0 : undefined}
          >
            {displayLabel}
            {showTrend && TrendIcon && (
              <TrendIcon className={cn(
                sizeClasses.icon,
                "ml-1",
                trend === "up" && "text-green-600",
                trend === "down" && "text-red-600"
              )} />
            )}
          </Badge>
        )
      
      case "card":
        return (
          <div
            className={cn(
              "rounded-lg border p-4 space-y-3",
              statusConfig.bgColor,
              statusConfig.borderColor,
              highContrast && "border-2 font-bold",
              fieldOptimized && "p-6 shadow-lg",
              onClick && "cursor-pointer hover:shadow-md transition-shadow"
            )}
            onClick={onClick}
            role={onClick ? "button" : "region"}
            tabIndex={onClick ? 0 : undefined}
            aria-label={accessibilityLabel}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showIcon && (
                  <Icon className={cn(sizeClasses.icon, statusConfig.color)} />
                )}
                <span className={cn(
                  "font-semibold",
                  sizeClasses.container,
                  statusConfig.color
                )}>
                  {displayLabel}
                </span>
                {showTrend && TrendIcon && (
                  <TrendIcon className={cn(
                    sizeClasses.icon,
                    trend === "up" && "text-green-600",
                    trend === "down" && "text-red-600"
                  )} />
                )}
              </div>
              
              {progress !== undefined && (
                <span className={cn(
                  "font-mono font-bold",
                  sizeClasses.container
                )}>
                  {progress}%
                </span>
              )}
            </div>
            
            {context && (
              <p className={cn(
                "text-muted-foreground",
                sizeClasses.container
              )}>
                {context}
              </p>
            )}
            
            {showProgress && progress !== undefined && (
              <Progress
                value={progress}
                constructionType="task"
                size={fieldOptimized ? "lg" : "default"}
                mobile={mobile}
              />
            )}
            
            {lastUpdated && (
              <div className={cn(
                "text-xs text-muted-foreground flex items-center gap-1",
                fieldOptimized && "text-sm"
              )}>
                <Clock className="h-3 w-3" />
                Updated {lastUpdated.toLocaleDateString()}
              </div>
            )}
          </div>
        )
      
      case "inline":
        return (
          <div
            className={cn(
              "inline-flex items-center gap-2",
              onClick && "cursor-pointer"
            )}
            onClick={onClick}
            role={onClick ? "button" : "status"}
            tabIndex={onClick ? 0 : undefined}
            aria-label={accessibilityLabel}
          >
            {showIcon && (
              <Icon className={cn(sizeClasses.icon, statusConfig.color)} />
            )}
            <span className={cn(
              "font-medium",
              sizeClasses.container,
              statusConfig.color
            )}>
              {displayLabel}
            </span>
            {progress !== undefined && (
              <span className={cn(
                "font-mono text-muted-foreground",
                sizeClasses.container
              )}>
                ({progress}%)
              </span>
            )}
            {showTrend && TrendIcon && (
              <TrendIcon className={cn(
                sizeClasses.icon,
                trend === "up" && "text-green-600",
                trend === "down" && "text-red-600"
              )} />
            )}
          </div>
        )
      
      case "compact":
        return (
          <div
            className={cn(
              "flex items-center gap-1",
              onClick && "cursor-pointer"
            )}
            onClick={onClick}
            role={onClick ? "button" : "status"}
            tabIndex={onClick ? 0 : undefined}
            aria-label={accessibilityLabel}
          >
            {showIcon && (
              <Icon className={cn("h-3 w-3", statusConfig.color)} />
            )}
            <span className={cn(
              "text-xs font-medium truncate max-w-20",
              statusConfig.color
            )}>
              {displayLabel}
            </span>
            {progress !== undefined && (
              <span className="text-xs font-mono text-muted-foreground">
                {progress}%
              </span>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div id={indicatorId}>
      {renderContent()}
    </div>
  )
}

export { StatusIndicator }