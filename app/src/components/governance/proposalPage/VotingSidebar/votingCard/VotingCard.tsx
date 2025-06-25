import { User } from "@prisma/client"
import React from "react"

import { EligibleCitizenAvatar } from "@/components/common/EligibleCitizenAvatar"
import VotingActions, {
  CardActionsProps,
} from "@/components/proposals/proposalPage/VotingSidebar/VotingActions"
import { CitizenshipQualification } from "@/lib/types"
import {
  CardTextProps,
  VoteType,
  VotingCardProps,
} from "@/components/proposals/proposal.types"

const CardText = ({ title, descriptionElement }: CardTextProps) => {
  const cardDescriptionTextStyling =
    "font-inter font-normal text-sm leading-5 tracking-[0%] text-center [&_a]:underline [&_a]:decoration-solid [&_a]:underline-offset-[0%] [&_a]:decoration-[0%]"
  return (
    <div className="text-center">
      <h4 className="text-h4">{title}</h4>
      {descriptionElement ? (
        React.isValidElement(descriptionElement) ? (
          React.cloneElement(
            descriptionElement as React.ReactElement<{ className?: string }>,
            {
              className: cardDescriptionTextStyling,
            },
          )
        ) : (
          <p className={cardDescriptionTextStyling}>{descriptionElement}</p>
        )
      ) : null}
    </div>
  )
}

const PreviousVote = ({ voteType }: { voteType: string }) => {
  let boxColor = ""
  let textColor = ""

  switch (voteType) {
    case VoteType.For:
      boxColor = "bg-success"
      textColor = "text-success-foreground"
      break
    case VoteType.Against:
      boxColor = "bg-red-200"
      textColor = "text-red-600"
      break
    case VoteType.Abstain:
      boxColor = "bg-backgroundSecondary"
      textColor = "text-primary"
      break
    default:
      break
  }

  return (
    <div className="w-[256px] h-[40px] gap-[8px] mt-4">
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

const VotingCard = ({
  cardText,
  cardActions,
  user,
  eligibility,
  previousVote,
}: VotingCardProps) => {
  return (
    <div className="rounded-t-lg border-l border-r border-t border-solid p-6 flex flex-col items-center">
      {eligibility && user && (
        <EligibleCitizenAvatar user={user} qualification={eligibility} />
      )}
      <CardText {...cardText} />
      {previousVote && <PreviousVote voteType={previousVote} />}
      {cardActions && <VotingActions {...cardActions} />}
    </div>
  )
}

export default VotingCard
export { CardText, type CardTextProps }
