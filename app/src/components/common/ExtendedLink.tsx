import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { default as NextLink, LinkProps as NextLinkProps } from "next/link"
import { forwardRef } from "react"
import { UrlObject } from "url"

import {
  Button as ShadcnButton,
  ButtonProps as ShadcnButtonProps,
} from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ButtonProps extends Omit<ShadcnButtonProps, "variant"> {
  as?: "button"
  href: string | UrlObject
  className?: string
  icon?: React.ReactNode
  text?: string
  subtext?: string
  variant?: "default" | "primary" | "ghost"
  target?: React.HTMLAttributeAnchorTarget
  showOutboundLinkIcon?: boolean
  onClick?: () => void
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      icon,
      text,
      subtext,
      href,
      variant = "default",
      className,
      target = "_blank",
      showOutboundLinkIcon = true,
      onClick,
      ...props
    },
    ref,
  ) => {
    if (props.disabled) {
      return (
        <div>
          <ShadcnButton
            ref={ref}
            className={cn(
              "group flex items-center gap-x-1.5 ",
              {
                "button-secondary text-inherit": variant === "default",
                "bg-optimismRed text-white hover:bg-optimismRed/70":
                  variant === "primary",
              },
              className,
            )}
            {...props}
          >
            <div>{icon}</div>
            <span>{text}</span>
            {showOutboundLinkIcon && href.toString().startsWith("http") && (
              <ArrowUpRight className="ml-0.5 w-4 h-4" />
            )}
            {subtext && (
              <span className="text-md text-gray-500">{subtext}</span>
            )}
          </ShadcnButton>
        </div>
      )
    }

    return (
      <NextLink href={href} passHref target={target} className="w-fit">
        <ShadcnButton
          ref={ref}
          onClick={onClick}
          className={cn(
            "group flex items-center gap-x-1.5 transition-all duration-150",
            {
              "button-secondary text-inherit": variant === "default",
              "bg-optimismRed text-white hover:bg-optimismRed/70":
                variant === "primary",
              "bg-transparent border hover:opacity-80 hover:bg-transparent":
                variant === "ghost",
            },
            className,
          )}
          {...props}
        >
          <div>{icon}</div>
          <span>{text}</span>
          {showOutboundLinkIcon && href.toString().startsWith("http") && (
            <ArrowUpRight className="ml-0.5 w-4 h-4" />
          )}
          {subtext && <span className="text-md text-gray-500">{subtext}</span>}
        </ShadcnButton>
      </NextLink>
    )
  },
)
Button.displayName = "Button"

interface LinkProps extends NextLinkProps {
  as?: "a"
  showUnderline?: boolean
  className?: string
  icon?: React.ReactNode
  text?: string
  subtext?: string
  showOutboundLinkIcon?: boolean
  onClick?: () => void
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      icon,
      text,
      subtext,
      className,
      showUnderline = true,
      showOutboundLinkIcon = true,
      onClick,
      ...props
    },
    ref,
  ) => {
    return (
      <NextLink
        href={href}
        {...props}
        ref={ref}
        passHref
        target="_blank"
        onClick={onClick}
        className={cn(
          "group flex sm:items-center space-x-1.5 text-inherit",
          {
            "items-start": Boolean(subtext),
            "items-center": !Boolean(subtext),
          },
          className,
        )}
      >
        <div
          className={cn([
            "sm:mt-0 shrink-0 w-fit h-fit",
            { "mt-2": Boolean(subtext), "mt-0": !Boolean(subtext) },
          ])}
        >
          {icon}
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-2">
          <div className="flex items-start space-x-1.5">
            <span className={cn([{ "group-hover:underline": showUnderline }])}>
              {text}
            </span>
            {showOutboundLinkIcon && href.toString().startsWith("http") && (
              <div className="mt-2 text-white">
                <ArrowUpRight className="ml-0.5 w-4 h-4" />
              </div>
            )}
          </div>
          {subtext && <span className="text-md text-gray-500">{subtext}</span>}
        </div>
      </NextLink>
    )
  },
)
Link.displayName = "Link"

type Props = ButtonProps | LinkProps

export default function Base({ as = "a", ...props }: Props) {
  if (as === "button") {
    return <Button {...(props as ButtonProps)} />
  }
  return <Link {...(props as LinkProps)} />
}
