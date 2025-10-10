import * as React from "react"

import { cn } from "@/lib/utils"
import { cn as dsCn, getTransitionClasses } from "../../lib/design-system/utils"
import type { CardProps } from "../design-system/types"

// Enhanced Card component with design system features
const Card = React.forwardRef<
  HTMLDivElement,
  CardProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, variant = 'default', size = 'md', interactive = false, onClick, children, ...props }, ref) => {
  
  // Build variant classes
  const variantClasses = {
    default: "bg-card border-border",
    gradient: "bg-gradient-to-br from-background to-muted/30 border-border/50",
    elevated: "bg-card border-border shadow-ds-lg"
  }
  
  // Build size classes with design system tokens
  const sizeClasses = {
    sm: "p-ds-sm rounded-md",
    md: "p-ds-lg rounded-lg", // 24px padding as specified
    lg: "p-ds-xl rounded-xl"
  }
  
  // Interactive states
  const interactiveClasses = interactive 
    ? "ds-card-hover cursor-pointer ds-interactive ds-focus-ring"
    : ""
  
  return (
    <div
      ref={ref}
      className={dsCn(
        cn(
          "border text-card-foreground shadow-ds-sm",
          variantClasses[variant],
          sizeClasses[size],
          interactiveClasses,
          getTransitionClasses('normal', ['transform', 'box-shadow']),
          className
        )
      )}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-ds-sm p-ds-md", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "ds-h3 font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("ds-caption text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-ds-md pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-ds-md pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }