"use client"

import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from "@/hooks/db/useUser"
import { refreshCurrentUserFarcasterProfile } from "@/lib/actions/privy"
import { cn } from "@/lib/utils"

type Props = {
  userId: string
  iconOnly?: boolean
  className?: string
}

export function RefreshFarcasterProfileButton({
  userId,
  iconOnly = false,
  className,
}: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })

  const handleRefresh = () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    const promise = refreshCurrentUserFarcasterProfile()
      .then(() => invalidateUser())
      .finally(() => setIsRefreshing(false))

    toast.promise(promise, {
      loading: "Refreshing Farcaster profile...",
      success: "Farcaster profile refreshed",
      error: (error) => error?.message || "Failed to refresh Farcaster profile",
    })
  }

  const button = (
    <Button
      variant="secondary"
      size={iconOnly ? "icon" : "default"}
      aria-label="Refresh Farcaster profile"
      onClick={handleRefresh}
      isLoading={isRefreshing}
      className={cn(iconOnly && "w-10 h-10", className)}
    >
      {iconOnly ? (
        <RefreshCw className="w-4 h-4" />
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Refresh from Farcaster
        </>
      )}
    </Button>
  )

  if (!iconOnly) {
    return button
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>Refresh from Farcaster</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
