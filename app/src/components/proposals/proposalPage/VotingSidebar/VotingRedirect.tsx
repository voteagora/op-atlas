import { Citizen } from "@prisma/client"
import Link from "next/link"

import { CITIZEN_TYPES } from "@/lib/constants"
import { ProposalData } from "@/lib/proposals"
import { CitizenshipQualification } from "@/lib/types"
import { getAgoraProposalLink } from "@/lib/utils/voting"

const VotingRedirect = ({
  proposalData,
  citizen,
  eligibility,
}: {
  proposalData: ProposalData
  citizen?: Citizen
  eligibility?: CitizenshipQualification
}) => {
  const showTelegramLink =
    citizen ||
    eligibility?.type === CITIZEN_TYPES.chain ||
    eligibility?.type === CITIZEN_TYPES.app

  return (
    <div className="flex flex-col gap-2 w-[304px] justify-center items-center text-sm text-secondary-foreground">
      <div className="flex flex-row gap-2 items-center">
        <div className="font-medium">Are you a delegate?</div>

        <Link
          className="underline"
          href={getAgoraProposalLink(proposalData.id)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Vote here
        </Link>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <div className="font-medium">Need help?</div>

        {showTelegramLink ? (
          <Link
            href="https://t.me/+zHNdFMH7BKIyNDQ0"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Ask on Telegram
          </Link>
        ) : (
          <Link
            className="underline "
            href="https://discord.com/channels/667044843901681675/1287789742582403123"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask on Discord
          </Link>
        )}
      </div>
    </div>
  )
}

export default VotingRedirect
