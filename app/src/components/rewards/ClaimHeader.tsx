import { Copy, Pencil } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { toast } from "sonner"

import { RewardWithProject } from "@/lib/types"
import { cn, copyToClipboard, formatNumber } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"

const ClaimHeader = ({
  reward,
  isUserAdmin,
  className,
}: {
  reward: RewardWithProject
  isUserAdmin: boolean
  className?: string
}) => {
  const { data: session } = useSession()
  const { setOpenDialog } = useAppDialogs()

  const copyGrantId = async () => {
    try {
      await copyToClipboard(reward.id)
      toast.success("Grant ID copied")
    } catch (error) {
      console.error("Error writing to clipboard", error)
    }
  }

  const editEmail = () => {
    setOpenDialog("email")
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="h-[120px] w-[120px] relative">
        <Image
          alt="sunny"
          src="/assets/images/big-sunny.png"
          height={120}
          width={120}
        />
      </div>

      <h2 className="text-center">Congratulations</h2>

      <div className="flex items-center gap-4 border rounded-xl p-8 w-full">
        <Image
          alt={reward.project.name}
          src={reward.project.thumbnailUrl ?? ""}
          height={48}
          width={48}
          className="h-12 w-12 object-center object-cover rounded-md"
        />
        <p className="font-semibold">{reward.project.name}</p>
        <div className="ml-auto flex items-center gap-2">
          <Image
            alt="op"
            src="/assets/chain-logos/optimism.png"
            height={24}
            width={24}
          />
          <p className="font-semibold">
            {/* @ts-expect-error Next converts Decimal to number bc Server Components suck */}
            {formatNumber(reward.amount)}
          </p>
        </div>
      </div>

      <p className="text-secondary-foreground text-center">
        You&apos;ve been rewarded in{" "}
        <span className="font-medium">
          {reward.roundId === "4"
            ? "Retro Funding Round 4: Onchain Builders"
            : reward.roundId === "5"
            ? "Retro Funding Round 5: OP Stack"
            : reward.roundId === "6"
            ? "Retro Funding Round 6: Governance"
            : "Retro Funding Round 1,2 or 3"}
        </span>
        . Project admins with a verified email address can claim this OP grant.
      </p>

      {session?.user && isUserAdmin ? (
        <div className="flex items-center gap-6">
          <p className="text-secondary-foreground text-sm">
            Claim by <span className="font-medium">Aug 5, 2025</span>
          </p>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-1">
            <p className="text-secondary-foreground text-sm">
              Grant ID <span className="font-medium">{reward.id}</span>
            </p>

            <Button
              variant="ghost"
              className="h-[14px] w-fit p-0"
              onClick={copyGrantId}
            >
              <Copy size={14} />
            </Button>
          </div>

          <div className="w-px h-10 bg-border" />

          <div className="flex items-center gap-1">
            <p className="text-sm text-muted-foreground">
              Email
              <Button
                variant="link"
                onClick={editEmail}
                className="font-medium text-secondary-foreground m-0 ml-1 p-0 h-fit"
              >
                {session.user.email || "Add your email"}
              </Button>
            </p>
            <Button
              variant="ghost"
              className="h-[14px] w-fit p-0"
              onClick={editEmail}
            >
              <Pencil size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-[#B80018] text-sm text-center">
            You are not an admin and cannot claim this grant. These are the
            project admins:
          </p>
          <div className="mx-auto flex items-center flex-wrap gap-4">
            {reward.project.team
              .filter(({ role }) => role === "admin")
              .map(({ user }) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 shrink-0"
                >
                  <Avatar className="h-6 w-6 rounded-full">
                    <AvatarImage
                      src={user.imageUrl ?? undefined}
                      alt={user.username ?? user.farcasterId}
                    />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-secondary-foreground text-sm font-medium">
                    {user.name}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClaimHeader
