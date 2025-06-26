import { Role } from "@prisma/client"
import Link from "next/link"

import { ArrowRightS } from "@/components/icons/reminx"
import { formatMMMd } from "@/lib/utils/date"

export function RoleRow({ role }: { role: Role }) {
  const isActive =
    role.startAt &&
    role.endAt &&
    new Date() >= new Date(role.startAt) &&
    new Date() <= new Date(role.endAt)
  const isUpcoming = role.startAt && new Date() < new Date(role.startAt)

  return (
    <Link
      href={`/governance/roles/${role.id}`}
      className="last:border-b-0 border-b border-border-secondary px-6 py-4 text-sm hover:bg-secondary/50 transition-colors"
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
          {role.startAt && role.endAt && (
            <div className="text-muted-foreground">
              Nominations open from {formatMMMd(new Date(role.startAt))}
              {" - "}
              {formatMMMd(new Date(role.endAt))}
            </div>
          )}
          <div className="text-xs text-foreground font-semibold w-[36px] h-[36px] rounded-lg bg-secondary flex items-center justify-center">
            <ArrowRightS className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
