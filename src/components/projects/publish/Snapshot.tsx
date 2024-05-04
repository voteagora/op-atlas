import { ProjectSnapshot } from "@prisma/client"
import { format } from "date-fns"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

import ExternalLink from "@/components/ExternalLink"

const EAS_URL_PREFIX = "https://optimism.easscan.org/attestation/view/"

export const Snapshot = ({ snapshot }: { snapshot: ProjectSnapshot }) => {
  return (
    <div className="flex items-center gap-2 border rounded-lg py-3 px-4">
      <Image
        alt="Checkmark"
        src="/assets/icons/circle-check-green.svg"
        height={20}
        width={20}
      />
      <p className="text-sm font-medium">
        {format(snapshot.createdAt, "yyyy-MM-dd, HH:mm a")}
      </p>

      <ExternalLink
        href={`${EAS_URL_PREFIX}${snapshot.attestationId}`}
        className="ml-auto text-sm font-medium flex items-center shrink-0"
      >
        View
        <ArrowUpRight size={16} className="ml-2.5" />
      </ExternalLink>
    </div>
  )
}
