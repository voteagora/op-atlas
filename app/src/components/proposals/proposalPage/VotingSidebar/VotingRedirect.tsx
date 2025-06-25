import { VotingRedirectProps } from "@/components/proposals/proposal.types"

const VotingRedirect = ({ callout, link }: VotingRedirectProps) => {
  return (
    <div className="delegate-redirect-card w-[304px] h-[40px] pt-[10px] pr-[var(--dimensions-8)] pb-[10px] pl-[var(--dimensions-8)] gap-[var(--dimensions-7)] rounded-[6px] flex items-center justify-center bg-secondary min-mar">
      <div className="flex items-center gap-[var(--dimensions-5)]">
        <p className="font-['Inter'] font-[500] text-[14px] leading-[20px] tracking-[0%] text-center">
          {callout}
        </p>
        {link && (
          <span className="font-['Inter'] font-[400] text-[14px] leading-[20px] tracking-[0%] text-center ml-2">
            <a
              className="underline decoration-solid underline-offset-[0%] decoration-[0%] color-[var(--secondary-foreground,#404454)]"
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
