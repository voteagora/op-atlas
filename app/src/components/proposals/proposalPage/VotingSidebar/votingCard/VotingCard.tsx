import { User } from "@prisma/client"
import React from "react"

import { EligibleCitizenAvatar } from "@/components/common/EligibleCitizenAvatar"
import VotingActions, {
  CardActionsProps,
} from "@/components/proposals/proposalPage/VotingSidebar/VotingActions"
import { CitizenshipQualification } from "@/lib/types"

interface CardTextProps {
  title: string
  descriptionElement?: string | React.ReactElement
}

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

export interface VotingCardProps {
  cardText: CardTextProps
  cardActions?: CardActionsProps
  user: User | null
  eligibility?: CitizenshipQualification
}

const VotingCard = ({
  cardText,
  cardActions,
  user,
  eligibility,
}: VotingCardProps) => {
  return (
    <div className="rounded-t-lg border-l border-r border-t border-solid p-6 flex flex-col items-center">
      {eligibility && user && (
        <EligibleCitizenAvatar user={user} qualification={eligibility} />
      )}
      <CardText {...cardText} />
      {cardActions && <VotingActions {...cardActions} />}
    </div>
  )
}

export default VotingCard
export { CardText, type CardTextProps }
