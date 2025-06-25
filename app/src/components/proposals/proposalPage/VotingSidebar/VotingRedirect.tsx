import { getAgoraProposalLink } from "@/app/proposals/utils/votingUtils"
import { ProposalData } from "@/lib/proposals"

const VotingRedirect = ({ proposalData }: { proposalData: ProposalData }) => {
  return (
    <div className="w-[304px] h-10 px-3 py-2 rounded-md flex items-center justify-center bg-secondary">
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm text-center">Are you a delegate?</p>
        <span className="font-normal text-sm text-center">
          <a
            className="underline text-secondary-foreground hover:text-foreground"
            href={getAgoraProposalLink(proposalData.id)}
          >
            Vote here
          </a>
        </span>
      </div>
    </div>
  )
}

export default VotingRedirect
