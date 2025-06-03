export interface VotingRedirectProps {
  title: string
  subtext: string
}

const VotingRedirect = ({ title, subtext }: VotingRedirectProps) => {
  return (
    <div className="delegate-redirect-card w-[304px] h-[120px] gap-[var(--dimensions-7)] p-[var(--dimensions-8)] rounded-[12px] flex items-center justify-center bg-secondary">
      <div className="w-[256px] h-[72px] gap-[var(--dimensions-5)] flex flex-col items-center justify-center">
        <p className="w-[256px] h-[24px] font-['Inter'] font-semibold text-[16px] leading-[24px] text-center align-middle bg-foreground">
          {title}
        </p>
        <p className="w-[256px] h-[40px] font-['Inter'] font-normal text-[14px] leading-[20px] text-center underline decoration-solid decoration-[0%] underline-offset-[0%] bg-secondary-foreground">
          {subtext}
        </p>
      </div>
    </div>
  )
}

export default VotingRedirect
