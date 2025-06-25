import { VotingRedirectProps } from "@/components/proposals/proposal.types"

const VotingRedirect = ({ callout, link }: VotingRedirectProps) => {
  return (
    <div className="w-[304px] h-10 px-3 py-2 rounded-md flex items-center justify-center bg-secondary">
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm text-center">
          {callout}
        </p>
        {link && (
          <span className="font-normal text-sm text-center">
            <a
              className="underline text-secondary-foreground hover:text-foreground"
              href={link.linkHref}
            >
              {link.linkText}
            </a>
          </span>
        )}
      </div>
    </div>
  )
}

export default VotingRedirect
