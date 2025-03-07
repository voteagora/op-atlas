import { Link as LinkIcon } from "lucide-react"
import Image, { type ImageProps } from "next/image"
import Link from "next/link"

interface DescriptionProps {
  name: string
  tags: string[]
  author: { avatarUrl?: string | null; name?: string | null }
  deployedOn: {
    name: string
    image: ImageProps["src"]
  }[]
  description: string | null
  socials: {
    website: string[]
    farcaster: string[]
    twitter: string | null
    mirror: string | null
  }
}

export default function Description({
  name,
  tags,
  author,
  deployedOn,
  description,
  socials,
}: DescriptionProps) {
  return (
    <div className="w-full">
      <div className="gap-x-12 space-y-4">
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-2xl">{name}</h3>
            <ul className="flex space-x-2">
              {tags.map((tag, i) => (
                <li
                  key={i}
                  className="px-2.5 py-1 rounded-full border text-sm font-medium"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="divide-x-2 flex items-center space-x-2">
          {author && (
            <div className="flex items-center space-x-2">
              <span>By</span>
              {author.avatarUrl && (
                <Image
                  src={author.avatarUrl}
                  alt={author.name ?? ""}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span>{author.name}</span>
            </div>
          )}
          <div className="pl-2 flex items-center space-x-2">
            <span>Deployed on</span>
            <ul className="flex items-center space-x-2">
              {deployedOn.map((network, i) => (
                <li key={i}>
                  <Image
                    src={network.image}
                    alt={network.name}
                    width={20}
                    height={20}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>{description}</div>
        <div className="flex items-center space-x-2 flex-wrap">
          {socials.website.map((website, i) => (
            <SocialsBadgeLink
              key={i}
              icon={<LinkIcon className="w-3.5 h-3.5" />}
              href={website}
              text={
                website.startsWith("http")
                  ? website.replace(/https?:\/\//, "")
                  : website
              }
            />
          ))}
          {socials.farcaster.map((farcaster, i) => (
            <SocialsBadgeLink
              key={i}
              icon={
                <Image
                  src="/assets/icons/farcaster-icon.svg"
                  width={14}
                  height={14}
                  alt="Farcaster"
                />
              }
              href={farcaster}
              text={
                farcaster.startsWith("http")
                  ? farcaster.split("/").at(-1) ??
                    farcaster.replace(/https?:\/\//, "")
                  : farcaster
              }
            />
          ))}
          {socials.twitter && (
            <SocialsBadgeLink
              icon={
                <Image
                  src="/assets/icons/x-icon.svg"
                  width={14}
                  height={14}
                  alt="Twitter"
                />
              }
              href={socials.twitter}
              text={socials.twitter.replace(/https?:\/\//, "")}
            />
          )}
          {socials.mirror && (
            <SocialsBadgeLink
              icon={<LinkIcon className="w-3.5 h-3.5" />}
              href={socials.mirror}
              text={socials.mirror.replace(/https?:\/\//, "")}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SocialsBadgeLink({
  icon,
  href,
  text,
}: {
  icon: React.ReactNode
  href: string
  text: string
}) {
  return (
    <div className="py-1 px-2.5 rounded-full bg-secondary text-sm font-medium flex items-center space-x-1">
      {icon}
      <Link href={href}>{text}</Link>
    </div>
  )
}
