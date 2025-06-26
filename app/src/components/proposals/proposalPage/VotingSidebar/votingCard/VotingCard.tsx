import React from "react"

import { CitizenshipQualification } from "@/lib/types"
import { CardTextProps, VoteType } from "@/components/proposals/proposal.types"
import { ProposalData } from "@/lib/proposals"
import { getVotingProps } from "@/lib/utils/voting"

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
      <h4 className="text-md font-semibold">
        {votingCardProps.cardText.title}
      </h4>
      {votingCardProps.cardText.descriptionElement &&
      votingCardProps.cardText.descriptionElement === "OFFCHAIN_STANDARD" ? (
        <p className="text-sm text-center">
          This proposal requires approval from the Citizen&#39;s House and Token
          House. Read more about the voting mechanism{" "}
          <a
            href="https://github.com/ethereum-optimism/OPerating-manual/blob/main/manual.md"
            className="text-sm text-center underline"
          >
            here
          </a>
          .
        </p>
      ) : (
        votingCardProps.cardText.descriptionElement &&
        (React.isValidElement(votingCardProps.cardText.descriptionElement) ? (
          React.cloneElement(
            votingCardProps.cardText.descriptionElement as React.ReactElement<{
              className?: string
            }>,
            {
              className:
                "text-sm text-center text-[#404454] font-weight-normal",
            },
          )
        ) : (
          <p className="text-sm text-center text-[#404454] font-weight-normal">
            {votingCardProps.cardText.descriptionElement}
          </p>
        ))
      )}
    </div>
  )
}

export { CardText, type CardTextProps }
