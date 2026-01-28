import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAddress, isAddress } from "viem"

import { CitizenshipBadge } from "@/components/common/CitizenshipBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCitizenSeasonByGovernanceAddress } from "@/db/citizenSeasons"
import { getUserByAddress } from "@/db/users"
import { shortenAddress } from "@/lib/utils"

interface PageProps {
  params: Promise<{ address: string }>
}

export default async function VoterAddressInfoPage({ params }: PageProps) {
  const { address } = await params

  if (!address || !isAddress(address)) {
    return <InvalidAddressView />
  }

  const checksumAddress = getAddress(address)

  const [citizenSeason, voterUser] = await Promise.all([
    getCitizenSeasonByGovernanceAddress(checksumAddress),
    getUserByAddress(checksumAddress),
  ])

  if (!citizenSeason) {
    notFound()
  }

  const entity = getEntityInfo(citizenSeason)
  const profileLink = getProfileLink(citizenSeason)
  const voterName =
    voterUser?.name || voterUser?.username || shortenAddress(checksumAddress)
  const voterImage = voterUser?.imageUrl

  if (entity.type === "user") {
    return (
      <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <div className="flex w-full flex-col items-center gap-4 rounded-xl bg-backgroundSecondary p-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={entity.imageUrl || ""}
                className="object-cover"
              />
              <AvatarFallback className="bg-secondary">
                <Image
                  src="/assets/images/sunny_default.svg"
                  alt="Default"
                  width={48}
                  height={48}
                />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-normal text-foreground">
                  {entity.name}
                </span>
                <CitizenshipBadge variant="icon" />
              </div>
              <span className="text-sm text-muted-foreground">
                voted as a Citizen
              </span>
            </div>
          </div>

          {profileLink && (
            <Link
              href={profileLink}
              className="text-sm text-secondary-foreground transition-colors hover:text-foreground hover:underline"
            >
              Click here to see their profile &rarr;
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={voterImage || ""} className="object-cover" />
            <AvatarFallback className="bg-secondary">
              <Image
                src="/assets/images/sunny_default.svg"
                alt="Default"
                width={48}
                height={48}
              />
            </AvatarFallback>
          </Avatar>
          <span className="text-2xl font-normal text-foreground">
            {voterName}
          </span>
        </div>

        <span className="text-sm text-muted-foreground">voted on behalf of</span>

        <div className="flex w-full flex-col items-center gap-4 rounded-xl bg-backgroundSecondary p-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={entity.imageUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-secondary">
              <Image
                src="/assets/images/sunny_default.svg"
                alt="Default"
                width={32}
                height={32}
              />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-normal text-foreground">
                {entity.name}
              </span>
              <CitizenshipBadge variant="icon" />
            </div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {entity.typeLabel}
            </span>
          </div>
        </div>

        {profileLink && (
          <Link
            href={profileLink}
            className="text-sm text-secondary-foreground transition-colors hover:text-foreground hover:underline"
          >
            Click here to see their profile &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}

function InvalidAddressView() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center gap-6 px-6">
      <Image
        src="/assets/icons/sunny-stars-custom-gimp-edit.svg"
        alt="Error"
        width={120}
        height={120}
      />
      <h4 className="text-xl font-normal text-foreground">
        Invalid wallet address
      </h4>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Please provide a valid Ethereum address.
      </p>
    </div>
  )
}

type CitizenSeasonWithRelations = NonNullable<
  Awaited<ReturnType<typeof getCitizenSeasonByGovernanceAddress>>
>

function getEntityInfo(citizenSeason: CitizenSeasonWithRelations) {
  if (citizenSeason.organizationId && citizenSeason.organization) {
    return {
      type: "organization" as const,
      typeLabel: "Organization",
      name: citizenSeason.organization.name,
      imageUrl: citizenSeason.organization.avatarUrl,
    }
  }

  if (citizenSeason.projectId && citizenSeason.project) {
    return {
      type: "project" as const,
      typeLabel: "Project",
      name: citizenSeason.project.name,
      imageUrl: citizenSeason.project.thumbnailUrl,
    }
  }

  if (citizenSeason.user) {
    return {
      type: "user" as const,
      typeLabel: "Citizen",
      name: citizenSeason.user.name || citizenSeason.user.username || "Citizen",
      imageUrl: citizenSeason.user.imageUrl,
    }
  }

  return {
    type: "unknown" as const,
    typeLabel: "Citizen",
    name: "Unknown",
    imageUrl: null,
  }
}

function getProfileLink(
  citizenSeason: CitizenSeasonWithRelations,
): string | null {
  if (citizenSeason.user?.username) {
    return `/${citizenSeason.user.username}`
  }
  if (citizenSeason.organizationId) {
    return `/${citizenSeason.organizationId}`
  }
  if (citizenSeason.projectId) {
    return `/project/${citizenSeason.projectId}`
  }
  return null
}
