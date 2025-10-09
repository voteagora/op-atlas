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

  const isCitizenHouseOnly = proposalData.proposalType.startsWith("OFFCHAIN")

  return (
    <div className="flex flex-col gap-0.5 w-[304px] justify-center items-center text-sm text-secondary-foreground">
      {isCitizenHouseOnly ? (
        <div className="font-normal text-center">
          Only the Citizen House can vote on this proposal.
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-normal">Are you a delegate?</div>

          <Link
            className="underline"
            href={getAgoraProposalLink(proposalData.id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Vote here
          </Link>
        </div>
      )}

      <div className="flex flex-row gap-2 items-center">
        <div className="font-normal">Need help?</div>

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
            href="https://discord.gg/fDWeZUNX"
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
