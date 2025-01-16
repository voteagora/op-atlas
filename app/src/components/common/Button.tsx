import React from "react"

import {
  Button as _,
  ButtonProps,
  buttonVariants,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { variant?: "primary" | "secondary" }
>(({ variant = "primary", className, ...props }, ref) => {
  const variants = {
    primary: "button-primary",
    secondary: "button-secondary",
  }

  return (
    <_ ref={ref} className={cn(variants[variant], className)} {...props}>
      {props.children}
    </_>
  )
})
Button.displayName = "Button"

export { Button, type ButtonProps, buttonVariants }
