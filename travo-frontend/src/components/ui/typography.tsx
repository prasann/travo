import * as React from "react"
import { cn } from "@/lib/utils"
import { cn as dsCn, getTypographyClass } from "../../lib/design-system/utils"
import type { TypographyProps } from "../design-system/types"

const Typography = React.forwardRef<
  HTMLElement,
  TypographyProps & React.HTMLAttributes<HTMLElement>
>(({ className, variant, color = 'default', as, children, ...props }, ref) => {
  
  // Color classes
  const colorClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground", 
    accent: "text-primary"
  }
  
  // Default element mapping
  const elementMap = {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body: 'p',
    caption: 'span',
    label: 'label'
  } as const
  
  const Component = as || elementMap[variant]
  
  return React.createElement(
    Component,
    {
      ref,
      className: dsCn(
        cn(
          getTypographyClass(variant),
          colorClasses[color],
          className
        )
      ),
      ...props
    },
    children
  )
})

Typography.displayName = "Typography"

export { Typography }