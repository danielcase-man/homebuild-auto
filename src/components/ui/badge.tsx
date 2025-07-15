import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, a11y, construction } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-orange-600 text-white hover:bg-orange-700",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Construction status variants
        completed: "border-transparent bg-construction-green text-white",
        "in-progress": "border-transparent bg-construction-blue text-white",
        pending: "border-transparent bg-construction-yellow text-black",
        delayed: "border-transparent bg-construction-red text-white",
        "on-hold": "border-transparent bg-construction-slate text-white",
        // High contrast variants for accessibility
        "completed-hc": "border-2 border-green-700 bg-green-600 text-white font-bold",
        "in-progress-hc": "border-2 border-blue-700 bg-blue-600 text-white font-bold",
        "pending-hc": "border-2 border-yellow-700 bg-yellow-600 text-black font-bold",
        "delayed-hc": "border-2 border-red-700 bg-red-600 text-white font-bold",
        "on-hold-hc": "border-2 border-gray-700 bg-gray-600 text-white font-bold",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        // Mobile-optimized sizes
        mobile: "px-4 py-2 text-sm font-bold min-h-[32px]",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Construction status for automatic variant selection
   */
  status?: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "DELAYED" | "ON_HOLD" | "CANCELLED"
  /**
   * High contrast mode for accessibility
   */
  highContrast?: boolean
  /**
   * Screen reader description
   */
  ariaLabel?: string
  /**
   * Whether badge represents an interactive element
   */
  interactive?: boolean
  /**
   * Icon to display alongside text
   */
  icon?: React.ReactNode
}

function Badge({ 
  className, 
  variant, 
  size,
  status,
  highContrast = false,
  ariaLabel,
  interactive = false,
  icon,
  children,
  ...props 
}: BadgeProps) {
  // Auto-select variant based on status
  const finalVariant = React.useMemo(() => {
    if (variant) return variant
    
    if (!status) return "default"
    
    const statusMap: Record<string, string> = {
      "COMPLETED": highContrast ? "completed-hc" : "completed",
      "IN_PROGRESS": highContrast ? "in-progress-hc" : "in-progress", 
      "PENDING": highContrast ? "pending-hc" : "pending",
      "DELAYED": highContrast ? "delayed-hc" : "delayed",
      "ON_HOLD": highContrast ? "on-hold-hc" : "on-hold",
      "CANCELLED": highContrast ? "delayed-hc" : "delayed"
    }
    
    return statusMap[status] || "default"
  }, [variant, status, highContrast])

  // Accessibility props
  const accessibilityProps = React.useMemo(() => {
    const props: Record<string, any> = {}
    
    if (ariaLabel) {
      props['aria-label'] = ariaLabel
    } else if (status) {
      props['aria-label'] = a11y.labels.projectStatus(status)
    }
    
    if (interactive) {
      props['role'] = 'button'
      props['tabIndex'] = 0
    } else {
      props['role'] = 'status'
    }
    
    return props
  }, [ariaLabel, status, interactive])

  const formattedChildren = React.useMemo(() => {
    if (status && !children) {
      return a11y.formatStatus(status)
    }
    return children
  }, [status, children])

  return (
    <div
      className={cn(
        badgeVariants({ variant: finalVariant as any, size }),
        interactive && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      {...accessibilityProps}
      {...props}
    >
      {icon && (
        <span className="mr-1" aria-hidden="true">
          {icon}
        </span>
      )}
      {status && construction.phases.getPhaseIcon(status) && !icon && (
        <span className="mr-1" aria-hidden="true">
          {construction.phases.getPhaseIcon(status)}
        </span>
      )}
      {formattedChildren}
    </div>
  )
}

export { Badge, badgeVariants }