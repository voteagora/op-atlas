import { format } from "date-fns"

import { type Role as RoleType } from "@/db/role"

export function Role({ role }: { role: RoleType }) {
  const isActive =
    new Date() >= new Date(role.startAt) && new Date() <= new Date(role.endAt)
  const isUpcoming = new Date() < new Date(role.startAt)

  return (
    <div
      key={role.id}
      className="last:border-b-0 border-b border-border-secondary px-6 py-4 text-sm"
    >
      <div className="flex flex-row gap-2 w-full justify-between items-center">
        <div className="flex flex-row gap-6 items-center">
          {isActive && (
            <div className="text-xs text-white font-semibold px-2 py-1 rounded-full bg-[#FF0000]">
              Now
            </div>
          )}
          {isUpcoming && (
            <div className="text-xs text-callout-foreground font-semibold px-2 py-1 rounded-full bg-callout">
              Soon
            </div>
          )}
          <div>{role.title}</div>
        </div>
        <div className="flex flex-row gap-6 items-center">
          <div className="text-muted-foreground">
            Nominations open from{" "}
            {format(new Date(role.startAt), "MMM d, yyyy")} -{" "}
            {format(new Date(role.endAt), "MMM d, yyyy")}
          </div>
          <div className="text-xs text-foreground font-semibold w-[36px] h-[36px] rounded-lg bg-secondary flex items-center justify-center">
            {">"}
          </div>
        </div>
      </div>
    </div>
  )
}
