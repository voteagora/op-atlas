import { VoteType } from "@/components/proposals/proposal.types"

const MyVote = ({ voteType }: { voteType: VoteType }) => {
  const getVoteColors = (voteType: VoteType) => {
    switch (voteType) {
      case VoteType.For:
        return {
          boxColor: "bg-success",
          textColor: "text-success-foreground",
        }
      case VoteType.Against:
        return {
          boxColor: "bg-red-200",
          textColor: "text-red-600",
        }
      case VoteType.Abstain:
        return {
          boxColor: "bg-backgroundSecondary",
          textColor: "text-primary",
        }
      default:
        return {
          boxColor: "",
          textColor: "",
        }
    }
  }

  const { boxColor, textColor } = getVoteColors(voteType)

  return (
    <div className="w-[256px] h-[40px] gap-[8px]">
      <div
        className={`w-[256px] h-[40px] gap-[5px] rounded-[6px] pt-[10px] pr-[16px] pb-[10px] pl-[16px] ${boxColor} justify-center flex items-center`}
      >
        <p
          className={`${textColor} font-medium text-[14px] leading-[20px] tracking-[0%] text-center`}
        >
          {voteType}
        </p>
      </div>
    </div>
  )
}

export { MyVote }
