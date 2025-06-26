import { ProposalData } from "@/lib/proposals"
import { getAgoraProposalLink } from "@/lib/utils/voting"

const VotingRedirect = ({ proposalData }: { proposalData: ProposalData }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-[304px] h-5 px-3 py-2 rounded-md flex items-center justify-center">
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
      <div className="w-[304px] h-5 px-3 py-2 rounded-md flex items-center justify-center">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-center transition-colors duration-200">
            Need help?
          </p>
          <span className="font-normal text-sm text-center">
            <a
              className="underline text-secondary-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
              href="https://discord.com/channels/667044843901681675/1287789742582403123"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask on Discord
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}

export default VotingRedirect
