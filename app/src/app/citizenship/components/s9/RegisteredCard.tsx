"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserFill } from "@/components/icons/remix"

import { S9ResignDialog } from "./S9ResignDialog"

export type RegisteredCardContext =
  | {
      kind: "user"
      citizenSeasonId: string
      user: {
        name: string | null
        username: string | null
        imageUrl: string | null
      }
    }
  | {
      kind: "organization" | "project"
      citizenSeasonId: string
      entity: {
        name: string
        imageUrl: string | null
      }
      responsibleUser?: {
        name: string
        href?: string
      }
    }

type RegisteredCardProps = {
  seasonName: string
  context: RegisteredCardContext
}

export function RegisteredCard({ seasonName, context }: RegisteredCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const isUserCard = context.kind === "user"
  const entityName = !isUserCard ? context.entity.name : null
  const entityImageUrl = !isUserCard ? context.entity.imageUrl : null
  const userImageUrl = isUserCard ? context.user.imageUrl : null

  const title = isUserCard
    ? "You’re a citizen!"
    : `${entityName ?? "This entity"} is a citizen!`

  const responsibleUserMarkup = useMemo(() => {
    if (isUserCard) {
      return null
    }

    const responsibilityDescriptor = context.kind === "project" ? "app" : "chain"
    const responsibleName = context.responsibleUser?.name ?? "The assigned admin"

    const content = (
      <>
        {context.responsibleUser?.href ? (
          <Link
            href={context.responsibleUser.href}
            className="underline font-semibold"
            target="_blank"
            rel="noreferrer"
          >
            {responsibleName}
          </Link>
        ) : (
          <span className="font-semibold">{responsibleName}</span>
        )}{" "}
        holds the voting badge for this {responsibilityDescriptor} and is responsible for casting votes in{" "}
        {seasonName}.
      </>
    )

    return content
  }, [context, isUserCard, seasonName])

  const description = isUserCard ? (
    <>
      You’re officially a Citizen for Season {seasonName} of Optimism Governance. You'll receive emails about active proposals.
    </>
  ) : (
    <>
      {responsibleUserMarkup}
    </>
  )

  const avatarAlt = isUserCard
    ? context.user.name ?? context.user.username ?? "Citizen profile"
    : entityName ?? "Citizen entity"

  const avatarInitial = !isUserCard
    ? entityName?.charAt(0).toUpperCase() ?? "?"
    : null

  return (
    <div className="w-full flex flex-col items-center text-center border-2 border-tertiary rounded-[12px] p-6 bg-background">
      <CitizenAvatar
        isUser={isUserCard}
        imageUrl={isUserCard ? userImageUrl : entityImageUrl}
        alt={avatarAlt}
        placeholderInitial={avatarInitial ?? undefined}
      />

      <div className="mt-4 text-base font-semibold text-foreground">{title}</div>

      <p className="mt-2 text-sm text-secondary-foreground">{description}</p>

      <div className="mt-4 flex w-full flex-col gap-2">
        <Link href="/governance" className="w-full">
          <Button className="w-full button-primary">Start participating</Button>
        </Link>

        <Button className="w-full button-outline" onClick={() => setIsDialogOpen(true)}>
          Resign
        </Button>
      </div>

      <S9ResignDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        citizenSeasonId={
          context.citizenSeasonId
        }
        context={{
          kind: context.kind,
          entityName: entityName ?? undefined,
        }}
      />
    </div>
  )
}

type CitizenAvatarProps = {
  isUser: boolean
  imageUrl: string | null
  alt: string
  placeholderInitial?: string
}

function CitizenAvatar({
  isUser,
  imageUrl,
  alt,
  placeholderInitial,
}: CitizenAvatarProps) {
  return (
    <div className="relative h-16 w-16">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center bg-secondary text-secondary-foreground",
            isUser
              ? "rounded-full border border-dashed border-muted"
              : "rounded-full font-semibold text-lg uppercase",
          )}
        >
          {isUser ? <UserFill className="h-6 w-6" fill="#000" /> : placeholderInitial}
        </div>
      )}

      <div className="absolute -top-1 -right-1 h-6 w-6">
        <Image
          src="/assets/icons/badgeholder-sunny.png"
          alt="Badgeholder icon"
          width={24}
          height={24}
        />
      </div>
    </div>
  )
}
