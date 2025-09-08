import OutboundArrowLink from "@/components/common/OutboundArrowLink"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrganizationWithTeamAndProjects } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function OrganizationTeam({
  className,
  organization,
}: {
  className?: string
  organization: OrganizationWithTeamAndProjects
}) {
  return (
    <div className={cn("flex flex-col gap-y-4 mt-12 w-full", className)}>
      <h2 className="text-xl font-normal">Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {organization.team.map(({ user }) => (
          <OutboundArrowLink
            key={user.id}
            target={`/${user.username}`}
            className="flex items-center gap-x-2 hover:opacity-80"
            text={user.name || user.username || ""}
            icon={
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.imageUrl || ""} />
                <AvatarFallback>
                  {user.name?.charAt(0) || user.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            }
          />
        ))}
      </div>
    </div>
  )
}
