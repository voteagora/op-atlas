import { getAgoraProposalLink } from "@/lib/utils/voting"
import { ProposalData } from "@/lib/proposals"

const VotingRedirect = ({ proposalData }: { proposalData: ProposalData }) => {
  return (
    <>
      <div className="w-[304px] h-10 px-3 py-2 rounded-md flex items-center justify-center">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-center">Are you a delegate?</p>
          <span className="font-normal text-sm text-center">
            <a
              className="underline text-secondary-foreground hover:text-foreground"
              href={getAgoraProposalLink(proposalData.id)}
              target="_blank"
            >
              Vote here
            </a>
          </span>
        </div>
      </div>
      <div className="w-[304px] h-10 px-3 py-2 rounded-md flex items-center justify-center">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-center">Need help?</p>
          <span className="font-normal text-sm text-center">
            <a
              className="underline text-secondary-foreground hover:text-foreground"
              href="https://discord.com/channels/667044843901681675/1287789742582403123"
              target="_blank"
            >
              Ask on Discord
            </a>
          </span>
        </div>
      </div>
    </>
  )
}

export default VotingRedirect
