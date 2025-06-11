import { VoteType } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"

export interface CardActionsProps {
  cardActionList: voteAction[]
}

interface voteAction {
  buttonStyle: string
  actionText: string
  actionType: string
  action: (data?: any) => void
  disabled?: boolean
}

const VotingActions = ({ cardActionList }: CardActionsProps) => {
  return (
    <div className="flex flex-col items-center mt-4 mr-6 mb-6 ml-6">
      {cardActionList &&
        cardActionList.map((action, idx) => (
          <CardAction
            {...action}
            key={idx}
          />
        ))}
    </div>
  )
}

const CardAction = ({
  buttonStyle,
  actionText,
  actionType,
  action,
  disabled,
}: voteAction) => {
  const handleAction = () => {
    switch (actionType.toLowerCase()) {
      case "log":
        console.log("log")
        break
      case "vote":
        // To be overwritten by the component that uses this
        action()
      default:
        console.log(`Action type: ${actionType}`)
        break
    }
  }

  return (
    <button
      onClick={handleAction}
      disabled={disabled}
      className={`rounded-md border border-solid p-3 mb-1 w-60 h-10 flex items-center justify-center font-medium text-sm leading-5 font-inter ${buttonStyle} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {actionText}
    </button>
  )
}

export default VotingActions
