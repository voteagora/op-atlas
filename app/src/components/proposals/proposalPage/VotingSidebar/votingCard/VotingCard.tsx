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
    <div className="text-center">
      <h4 className="text-h4">{votingCardProps.cardText.title}</h4>
      {votingCardProps.cardText.descriptionElement ? (
        React.isValidElement(votingCardProps.cardText.descriptionElement) ? (
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

export { CardText, type CardTextProps }
