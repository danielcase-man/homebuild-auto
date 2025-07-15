import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Construction project status for semantic styling
     */
    projectStatus?: "active" | "pending" | "completed" | "delayed"
    /**
     * Accessibility role for screen readers
     */
    role?: string
    /**
     * ARIA label for complex cards
     */
    ariaLabel?: string
    /**
     * Whether this card is interactive/clickable
     */
    interactive?: boolean
  }
>(({ className, projectStatus, role = "region", ariaLabel, interactive, ...props }, ref) => {
  const statusStyles = {
    active: "border-l-4 border-l-construction-blue bg-blue-50/30",
    pending: "border-l-4 border-l-construction-yellow bg-yellow-50/30", 
    completed: "border-l-4 border-l-construction-green bg-green-50/30",
    delayed: "border-l-4 border-l-construction-red bg-red-50/30"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        projectStatus && statusStyles[projectStatus],
        interactive && "cursor-pointer hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      role={role}
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    /**
     * Heading level for proper document structure
     */
    level?: 1 | 2 | 3 | 4 | 5 | 6
  }
>(({ className, level = 3, children, ...props }, ref) => {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
  
  return React.createElement(
    HeadingTag,
    {
      ref,
      className: cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      ),
      ...props
    },
    children
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }