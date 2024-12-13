import Link, { LinkProps } from "next/link"

type Props = LinkProps & {
  className?: string
  children: React.ReactNode
}

const ExternalLink = ({ className, children, ...rest }: Props) => {
  return (
    <Link
      {...rest}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  )
}

/**
 * Renders a plain div element if the href is not provided
 */
export const MaybeLink = ({
  url,
  className,
  children,
  ...rest
}: Omit<Props, "href"> & { url?: string | null }) => {
  if (!url) {
    return <div className={className}>{children}</div>
  }

  return (
    <ExternalLink href={url} className={className} {...rest}>
      {children}
    </ExternalLink>
  )
}

export default ExternalLink
