import Image from "next/image"
import React from "react"

import {
  Button as _,
  ButtonProps as ShadcnButtonProps,
  buttonVariants,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonProps = {
  as?: "button"
  variant?: "primary" | "secondary"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
} & React.ComponentProps<typeof _>

type DropdownProps = {
  as?: "dropdown"
  variant?: "primary" | "secondary"
  leftIcon?: React.ReactNode
} & React.ComponentProps<typeof _>

type Props = ButtonProps | DropdownProps

const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", as = "button", className, ...props }, ref) => {
    const variants: {
      [key in typeof variant]: string
    } = {
      primary: "button-primary",
      secondary: "button-secondary",
    }

    if (as === "dropdown") {
      const { leftIcon, ...dropdownProps } = props as DropdownProps
      return (
        <_
          ref={ref}
          className={cn(
            variants[variant],
            "w-fit gap-x-2 font-normal",
            className,
          )}
          {...dropdownProps}
        >
          {leftIcon}
          {props.children}
          <Image
            src="/assets/icons/arrowDownIcon.svg"
            height={8}
            width={10}
            alt="Arrow up"
          />
        </_>
      )
    }

    const { leftIcon, rightIcon, ...buttonProps } = props as ButtonProps

    return (
      <_
        ref={ref}
        className={cn(variants[variant], "w-fit gap-x-2", className)}
        {...buttonProps}
      >
        {leftIcon}
        {props.children}
        {rightIcon}
      </_>
    )
  },
)
Button.displayName = "Button"

export { Button, type ShadcnButtonProps as ButtonProps, buttonVariants }
