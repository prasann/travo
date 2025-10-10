import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { cn as dsCn, getTransitionClasses } from "../../lib/design-system/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md ds-button-hover ds-focus-ring font-medium disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-ds-sm hover:shadow-ds-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-ds-sm hover:shadow-ds-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-ds-sm hover:shadow-ds-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-ds-sm hover:shadow-ds-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-10 px-ds-md py-ds-sm ds-text-base",
        sm: "h-9 rounded-md px-ds-sm ds-text-sm",
        lg: "h-11 rounded-md px-ds-lg ds-text-lg",
        icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={dsCn(
          cn(buttonVariants({ variant, size })),
          getTransitionClasses('fast', ['all']),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }