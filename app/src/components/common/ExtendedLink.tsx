import Image from "next/image"
import { default as NextLink, LinkProps as NextLinkProps } from "next/link"
import { forwardRef } from "react"
import { UrlObject } from "url"

import { Button as ShadcnButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ButtonProps {
  as?: "button"
  href: string | UrlObject
  className?: string
  icon?: React.ReactNode
  text?: string
  subtext?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, text, subtext, href, className, ...props }, ref) => {
    return (
      <NextLink href={href} passHref target="_blank" className="w-fit">
        <ShadcnButton
          ref={ref}
          className={cn(
            "group flex items-center gap-x-1.5 button-secondary text-inherit",
            className,
          )}
        >
          {icon}
          <span>{text}</span>
          {href.toString().startsWith("http") && (
            <Image
              src="/assets/icons/arrow-up-right.svg"
              width={10}
              height={10}
              alt="External link"
              className="ml-0.5"
            />
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
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { href, icon, text, subtext, className, showUnderline = true, ...props },
    ref,
  ) => {
    return (
      <NextLink
        href={href}
        {...props}
        ref={ref}
        passHref
        className={cn(
          "group flex items-center gap-x-1.5 text-inherit",
          className,
        )}
      >
        {icon}
        <span className={cn([{ "group-hover:underline": showUnderline }])}>
          {text}
        </span>
        {href.toString().startsWith("http") && (
          <Image
            src="/assets/icons/arrow-up-right.svg"
            width={10}
            height={10}
            alt="External link"
            className="ml-0.5"
          />
        )}
        {subtext && <span className="text-md text-gray-500">{subtext}</span>}
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
