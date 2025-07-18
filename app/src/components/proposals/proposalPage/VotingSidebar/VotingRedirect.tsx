import { Citizen } from "@prisma/client"

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
    <div className="flex flex-col gap-0.5">
      <div className="w-[304px] h-5 px-3 py-1 rounded-md flex items-center justify-center">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-center transition-colors duration-200">
            Are you a delegate?
          </p>
          <span className="font-normal text-sm text-center">
            <a
              className="underline text-secondary-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
              href={getAgoraProposalLink(proposalData.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Vote here
            </a>
          </span>
        </div>
      </div>
      <div className="w-[304px] h-5 px-3 py-1 rounded-md flex items-center justify-center">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-center transition-colors duration-200">
            Need help?
          </p>
          <span className="font-normal text-sm text-center">
            {showTelegramLink ? (
              <a
                className="underline text-secondary-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
                href="https://t.me/+zHNdFMH7BKIyNDQ0"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask on Telegram
              </a>
            ) : (
              <a
                className="underline text-secondary-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
                href="https://discord.com/channels/667044843901681675/1287789742582403123"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask on Discord
              </a>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default VotingRedirect
