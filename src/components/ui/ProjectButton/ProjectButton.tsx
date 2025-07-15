import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const projectbuttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm active:scale-[0.98]",
  {
    variants: {
            variant: {\n        primary: "bg-primary text-primary-foreground hover:bg-primary/90",\n        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",\n        outline: "border border-input hover:bg-accent hover:text-accent-foreground",\n        ghost: "hover:bg-accent hover:text-accent-foreground",\n        construction: "bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md",\n        safety: "bg-orange-500 hover:bg-orange-600 text-white font-bold border-2 border-orange-700"\n      },\n      size: {\n        sm: "h-8 px-3 text-xs",\n        md: "h-10 px-4 py-2",\n        lg: "h-11 px-8",\n        xl: "h-12 px-10 text-base"\n      }
    },
    defaultVariants: {
            variant: "primary",\n      size: "sm"
    },
  }
)

export interface ProjectButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof projectbuttonVariants> {
    loading?: boolean\n  leftIcon?: React.ReactNode\n  rightIcon?: React.ReactNode
}

const ProjectButton = React.forwardRef<HTMLButtonElement, ProjectButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <button
        className={cn(projectbuttonVariants({ variant, size, className }))}
        ref={ref}
        aria-label={ariaLabel}\n        role="button"\n        data-testid="construction-component"\n        aria-live="polite"
        {...props}
      >
        children
      </button>
    )
  }
)

ProjectButton.displayName = "ProjectButton"

export { ProjectButton, projectbuttonVariants }