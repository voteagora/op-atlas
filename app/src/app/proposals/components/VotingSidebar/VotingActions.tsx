"use client"

import { VoteType } from "@/app/proposals/components/VotingSidebar/votingColumn/VotingColumn"

export interface CardActionsProps {
  cardActionList: voteAction[]
}

interface voteAction {
  buttonStyle: string
  actionText: string
  actionType: string
  action: (data?: any) => void
}

const VotingActions = ({ cardActionList }: CardActionsProps) => {
  return (
    <div className="flex flex-col items-center mt-4 mr-6 mb-6 ml-6">
      {cardActionList &&
        cardActionList.map((action, idx) => (
          <CardAction {...action} key={idx} />
        ))}
    </div>
  )
}

const CardAction = ({
  buttonStyle,
  actionText,
  actionType,
  action,
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
      className={`rounded-md border border-solid p-3 mb-1 w-60 h-10 flex items-center justify-center font-medium text-sm leading-5 font-inter ${buttonStyle}`}
    >
      {actionText}
    </button>
  )
}

export default VotingActions
