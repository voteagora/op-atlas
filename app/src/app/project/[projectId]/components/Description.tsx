"use client"

import { Link as LinkIcon } from "lucide-react"
import { ChevronDownIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import SocialBadgeLink from "@/components/common/SocialBadgeLink"
import TrackedLink from "@/components/common/TrackedLink"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, truncateString } from "@/lib/utils"

interface DescriptionProps {
  name?: string
  tags: string[]
  author: {
    avatarUrl?: string | null
    name?: string | null
    farcasterHandle?: string
  }
  deployedOn?: {
    logo: string
    name: string
  }[]
  description?: string | null
  socials: {
    website?: string[]
    farcaster?: string[]
    twitter?: string | null
    mirror?: string | null
  }
  projectId: string
  isMember: boolean
}

export default function Description({
  name,
  tags,
  author,
  deployedOn,
  description,
  socials,
  projectId,
  isMember,
}: DescriptionProps) {
  if (!name) {
    return null
  }

  return (
    <div className="w-full">
      <div className="gap-x-12 space-y-4">
        <div>
          <div className="flex items-start space-x-3">
            <Tooltip>
              <TooltipTrigger>
                <h3 className="font-semibold text-2xl text-left">
                  {truncateString(name, 64, "...")}
                </h3>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
            <ul className="flex space-x-2">
              {tags
                .filter((tag) => tag !== "")
                .map((tag, i) => (
                  <li
                    key={i}
                    className="px-2.5 py-1 rounded-full border-[1px] border-[#E0E2EB]"
                  >
                    <span className="text-sm font-medium">{tag}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
        <div className="divide-x-2 flex items-center space-x-2">
          {author && (
            <div className="flex items-center space-x-2 text-secondary-foreground">
              <span>By</span>
              {author?.farcasterHandle ? (
                <TrackedLink
                  href={`/${author?.farcasterHandle}`}
                  className="flex items-center space-x-2 hover:opacity-80"
                  eventName="Link Click"
                  target="_blank"
                  eventData={{
                    projectId,
                    source: "project_page",
                    linkName: "Project Author",
                    isContributor: isMember,
                  }}
                >
                  {author.avatarUrl && (
                    <Image
                      src={author.avatarUrl}
                      alt={author.name ?? ""}
                      width={20}
                      height={20}
                      className="rounded-full shrink-0"
                    />
                  )}
                  <span>{author.name}</span>
                </TrackedLink>
              ) : (
                <div className="flex items-center space-x-2">
                  {author.avatarUrl && (
                    <Image
                      src={author.avatarUrl}
                      alt={author.name ?? ""}
                      width={20}
                      height={20}
                      className="rounded-full shrink-0"
                    />
                  )}
                  <span>{author.name}</span>
                </div>
              )}
            </div>
          )}
          {Boolean(deployedOn?.length) && (
            <div className="pl-2 flex items-center space-x-2">
              <span className="text-secondary-foreground">Deployed on</span>
              <ul className="flex items-center gap-2 flex-wrap">
                {deployedOn!.map((network, i) => (
                  <li key={i} className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger>
                        <Image
                          src={network.logo}
                          alt={network.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </TooltipTrigger>
                      <TooltipContent>{network.name}</TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <TruncatedText description={description ?? ""} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {socials.website?.map((website, i) => (
            <SocialBadgeLink
              key={i}
              icon={<LinkIcon className="w-3.5 h-3.5" />}
              href={website}
              text={
                website.startsWith("http")
                  ? website.replace(/https?:\/\//, "")
                  : website
              }
              type="website"
              source="project_page"
            />
          ))}
          {socials.farcaster?.map((farcaster, i) => (
            <SocialBadgeLink
              key={i}
              icon={
                <Image
                  src="/assets/icons/farcaster-icon.svg"
                  width={14}
                  height={14}
                  alt="Farcaster"
                />
              }
              target="_self"
              href={farcaster}
              text={
                farcaster.startsWith("http")
                  ? farcaster.split("/").at(-1) ??
                    farcaster.replace(/https?:\/\//, "")
                  : farcaster
              }
              type="farcaster"
              source="project_page"
            />
          ))}
          {socials.twitter && (
            <SocialBadgeLink
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
              type="X"
              source="project_page"
            />
          )}
          {socials.mirror && (
            <SocialBadgeLink
              icon={<LinkIcon className="w-3.5 h-3.5" />}
              href={socials.mirror}
              text={socials.mirror.replace(/https?:\/\//, "")}
              type="Mirror"
              source="project_page"
            />
          )}
        </div>
      </div>
    </div>
  )
}

const TruncatedText = ({ description }: { description: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTruncated, setIsTruncated] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(
        textRef.current.scrollHeight > textRef.current.clientHeight,
      )
    }
  }, [description])

  return (
    <div className="space-y-4">
      <p
        ref={textRef}
        className={cn([
          "overflow-hidden text-secondary-foreground",
          { "line-clamp-3": !isExpanded },
        ])}
      >
        {description}
      </p>
      {isTruncated && (
        <button
          className="text-secondary-foreground flex items-center spce-x-0.5 font-normal"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{isExpanded ? "Read Less" : "Read More"}</span>
          <ChevronDownIcon size={16} />
        </button>
      )}
    </div>
  )
}
