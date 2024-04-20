import React, { memo } from "react"
import { User } from "@prisma/client"
import { useAppDialogs } from "@/providers/DialogProvider"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"

const ProfileDetailCard = ({
  className,
  user,
}: {
  className?: string
  user: User
}) => {
  const { setOpenDialog } = useAppDialogs()

  const initials = (user?.name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className={cn("flex gap-x-4", className)}>
      <Avatar className="w-20 h-20 my-0.5">
        <AvatarImage src={user?.imageUrl ?? ""} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <h2>{user.name ?? ""}</h2>
        {user.bio && <p>{user.bio}</p>}

        <div className="mt-2 mr-4 flex items-center gap-x-4">
          <p className="text-sm text-muted-foreground">
            Username{" "}
            <span className="font-medium text-secondary-foreground">
              @{user.username}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Email
            <Button
              variant="link"
              onClick={() => setOpenDialog("email")}
              className="font-medium text-secondary-foreground m-0 ml-1 p-0 h-fit"
            >
              {user.email ? user.email : "Add your email"}
            </Button>
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => setOpenDialog("edit_profile")}
        className="ml-auto"
      >
        Edit Profile
      </Button>
    </div>
  )
}

export default memo(ProfileDetailCard)
