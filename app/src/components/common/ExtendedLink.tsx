import Image from "next/image"
import { default as NextLink, LinkProps as NextLinkProps } from "next/link"
import { forwardRef } from "react"
import { UrlObject } from "url"

import { Button as ShadcnButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BaseProps {
  as?: "a" | "button"
  className?: string
  icon?: React.ReactNode
  text?: string
  subtext?: string
}

interface ButtonProps extends BaseProps {
  as?: "button"
  href: string | UrlObject
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, text, subtext, href, className, ...props }, ref) => {
    return (
      <NextLink href={href} passHref>
        <ShadcnButton
          ref={ref}
          variant="secondary"
          className={cn("group flex items-center gap-x-1.5", className)}
        >
          {icon}
          <span className="group-hover:underline">{text}</span>
          <Image
            src="/assets/icons/arrow-up-right.svg"
            width={10}
            height={10}
            alt="External link"
            className="ml-0.5"
          />
          {subtext && <span className="text-md text-gray-500">{subtext}</span>}
        </ShadcnButton>
      </NextLink>
    )
  },
)
Button.displayName = "Button"

interface LinkProps extends BaseProps, NextLinkProps {
  as?: "a"
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, icon, text, subtext, className, ...props }, ref) => {
    const {} = props
    return (
      <NextLink
        href={href}
        {...props}
        ref={ref}
        passHref
        className={cn("group flex items-center gap-x-1.5", className)}
      >
        {icon}
        <span className="group-hover:underline">{text}</span>
        <Image
          src="/assets/icons/arrow-up-right.svg"
          width={10}
          height={10}
          alt="External link"
          className="ml-0.5"
        />
        {subtext && <span className="text-md text-gray-500">{subtext}</span>}
      </NextLink>
    )
  },
)
Link.displayName = "Link"

type Props = BaseProps & NextLinkProps

export default function Base({ as = "a", ...props }: Props) {
  if (as === "button") {
    return <Button {...props} />
  }
  return <Link {...props} />
}
