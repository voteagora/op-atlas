import Image from "next/image"

interface ProfileHeaderSocialLinkProps {
  href: string
  icon: string
  text: string
  tooltipText: string
}

function ProfileHeaderSocialLink({ href, icon, text, tooltipText }: ProfileHeaderSocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-x-2 rounded-full bg-gray-300 px-3 py-1 hover:bg-gray-200 transition-colors"
    >
      <Image
        src={icon}
        width={14}
        height={13}
        alt={tooltipText}
      />
      <span className="text-sm text-secondary-foreground">
        {text}
      </span>
      <span className="absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-sm shadow-md opacity-0 transition-opacity group-hover:opacity-100">
        {tooltipText}
      </span>
    </a>
  )
}

export default ProfileHeaderSocialLink