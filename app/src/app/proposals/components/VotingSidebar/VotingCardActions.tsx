"use client"

export interface CardActionsProps {
  cardActionList: CardAction[]
}

interface CardAction {
  buttonStyle: string
  actionText: string
  actionType: string
}

const VotingCardActions = ({ cardActionList }: CardActionsProps) => {
  return (
    <div className="flex flex-col items-center mt-4 mr-6 mb-6 ml-6">
      {cardActionList.map((action, idx) => (
        <CardAction {...action} key={idx} />
      ))}
    </div>
  )
}

const CardAction = ({ buttonStyle, actionText, actionType }: CardAction) => {
  const handleAction = () => {
    switch (actionType) {
      case "log":
        console.log("log")
        break
      default:
        console.log(`Action type: ${actionType}`)
        break
    }
  }

  return (
    <button
      onClick={handleAction}
      className={`rounded-[6px] border border-solid p-[10px] ${buttonStyle}`}
    >
      {actionText}
    </button>
  )
}

export default VotingCardActions
