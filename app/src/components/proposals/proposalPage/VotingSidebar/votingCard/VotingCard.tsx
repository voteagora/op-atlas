import React from "react"

import { CitizenshipQualification } from "@/lib/types"
import { CardTextProps, VoteType } from "@/components/proposals/proposal.types"
import { ProposalData } from "@/lib/proposals"
import { getVotingProps } from "@/app/proposals/utils/votingUtils"

const CardText = ({
  proposalData,
  isCitizen,
  vote,
  eligibility,
}: {
  proposalData: ProposalData
  isCitizen: boolean
  vote?: VoteType
  eligibility?: CitizenshipQualification
}) => {
  const { votingCardProps } = getVotingProps(
    proposalData,
    isCitizen,
    vote,
    eligibility,
  )

  return (
    <div className="flex flex-col text-center gap-y-2">
      <h4 className="text-h4">{votingCardProps.cardText.title}</h4>
      {votingCardProps.cardText.descriptionElement &&
        (React.isValidElement(votingCardProps.cardText.descriptionElement) ? (
          React.cloneElement(
            votingCardProps.cardText.descriptionElement as React.ReactElement<{
              className?: string
            }>,
            {
              className: "text-sm text-center",
            },
          )
        ) : (
          <p className="text-sm text-center">
            {votingCardProps.cardText.descriptionElement}
          </p>
        ))}
    </div>
  )
}

export { CardText, type CardTextProps }
