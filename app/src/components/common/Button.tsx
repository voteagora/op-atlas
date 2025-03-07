import Image from "next/image"
import React from "react"

import {
  Button as _,
  ButtonProps as ShadcnButtonProps,
  buttonVariants,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BaseProps = {
  variant?: "primary" | "secondary" | "outline"
  outline?: boolean
  leftIcon?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

type ButtonProps = BaseProps & {
  as?: "button"
  rightIcon?: React.ReactNode
} & Omit<ShadcnButtonProps, "variant">

type DropdownProps = BaseProps & {
  as?: "dropdown"
} & Omit<ShadcnButtonProps, "variant">

type Props = ButtonProps | DropdownProps

const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", as = "button", className, ...props }, ref) => {
    const variants: {
      [key in typeof variant]: string
    } = {
      primary: "button-primary",
      secondary: "button-secondary",
      outline: "button-outline",
    }

    if (as === "dropdown") {
      const { leftIcon, ...restDropdown } = props as Omit<
        DropdownProps,
        "variant"
      >
      return (
        <_
          ref={ref}
          className={cn(
            variants[variant],
            "w-fit gap-x-2 font-normal",
            className,
          )}
          {...restDropdown}
        >
          {leftIcon}
          {props.children}
          <Image
            src="/assets/icons/arrowDownIcon.svg"
            height={8}
            width={10}
            alt="Arrow down"
          />
        </_>
      )
    }

    const { leftIcon, rightIcon, ...restButton } = props as Omit<
      ButtonProps,
      "variant"
    >

    return (
      <_
        ref={ref}
        className={cn(variants[variant], "w-fit gap-x-2", className)}
        {...restButton}
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
