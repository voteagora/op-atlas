import Image from "next/image"

type GrantContainerProps = {
  title: string
  description: string
  icon: string
  links: {
    label: string
    url: string
  }[]
}

export const GrantContainer = ({
  title,
  description,
  icon,
  links,
}: GrantContainerProps) => {
  return (
    <div className="flex flex-col gap-4 py-6 h-full mr-8">
      <Image src={icon} alt={title} width={24} height={24} />
      <h3 className="text-lg font-semibold h-[3.5rem] leading-7 line-clamp-2">
        {title}
      </h3>
      <p className="text-secondary-foreground h-[4.5rem] leading-6 line-clamp-3">
        {description}
      </p>
      <div className="flex flex-col gap-2 pt-4">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            className="flex items-center justify-between border border-border px-4 py-3 rounded-lg hover:bg-destructive hover:text-white transition-colors text-sm"
          >
            {link.label}
            <Image
              src="/assets/icons/arrow-right-s-line.svg"
              alt="Arrow right"
              width={20}
              height={20}
            />
          </a>
        ))}
      </div>
    </div>
  )
}
