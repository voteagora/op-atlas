import { ProjectSnapshot } from "@prisma/client"
import { format } from "date-fns"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

import ExternalLink from "@/components/ExternalLink"
import { CheckboxCircleFIll } from "@/components/icons/remix"
import { EAS_URL_PREFIX } from "@/lib/utils"

export const Snapshot = ({ snapshot }: { snapshot: ProjectSnapshot }) => {
  return (
    <div className="flex items-center gap-2 border rounded-lg  py-2 px-3 h-10">
      <CheckboxCircleFIll className="w-5 h-5" fill="#1DBA6A" />
      <p className="text-sm font-normal text-foreground">
        {format(snapshot.createdAt, "yyyy-MM-dd, HH:mm a")}
      </p>

      <ExternalLink
        href={`${EAS_URL_PREFIX}${snapshot.attestationId}`}
        className="ml-auto text-sm font-normal  shrink-0 text-text"
      >
        View attestation
      </ExternalLink>
    </div>
  )
}
