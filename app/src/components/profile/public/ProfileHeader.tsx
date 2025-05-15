
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { UserWithAddresses } from "@/lib/types"
import { cn } from "@/lib/utils"

import { useUsername } from "@/hooks/useUsername"
import ProfileHeaderLinks from "./ProfileHeaderLinks"

const ProfileHeader = ({
  className,
  user,
}: {
  className?: string
  user: UserWithAddresses
}) => {

  const username = useUsername(user)

  return (
    <div className={cn("flex gap-x-4 border-b border-border pb-6 w-full", className)}>
      <div className="flex flex-col space-y-6">
        {user.imageUrl && (
          <Avatar className="w-20 h-20 my-0.5">
            <AvatarImage src={user.imageUrl} />
          </Avatar>
        )}
        <div className="flex flex-col gap-6">
          <div className="text-3xl font-semibold">{username} </div>
          <div className="text-sm text-muted-foreground">{user.bio}</div>
          <ProfileHeaderLinks user={user} />
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader;
