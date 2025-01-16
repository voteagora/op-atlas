import React from "react"

import {
  Button as _,
  ButtonProps,
  buttonVariants,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    variant?: "primary" | "secondary"
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
  }
>(({ variant = "primary", className, ...props }, ref) => {
  const variants = {
    primary: "button-primary",
    secondary: "button-secondary",
  }

  const { leftIcon, rightIcon, ...rest } = props

  return (
    <_
      ref={ref}
      className={cn(variants[variant], "w-fit gap-x-2", className)}
      {...rest}
    >
      {leftIcon}
      {props.children}
      {rightIcon}
    </_>
  )
})
Button.displayName = "Button"

export { Button, type ButtonProps, buttonVariants }
