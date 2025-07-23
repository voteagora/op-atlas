import React from "react"

import { CardTextProps, VoteType } from "@/components/proposals/proposal.types"
import { ProposalData } from "@/lib/proposals"
import { CitizenshipQualification } from "@/lib/types"
import { getAgoraProposalLink, getVotingProps } from "@/lib/utils/voting"

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

  const { cardText } = votingCardProps

  const renderDescription = () => {
    if (cardText.needsAgoraLink && cardText.proposalId && typeof cardText.descriptionElement === 'string') {
      const agoraLink = getAgoraProposalLink(cardText.proposalId)
      const text = cardText.descriptionElement

      const parts = text.split('Agora')
      if (parts.length === 2) {
        return (
          <p className="text-sm text-center text-[#404454] font-weight-normal">
            {parts[0]}
            <a 
              href={agoraLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#404454] hover:opacity-80 transition-opacity duration-200"
            >
              Agora
            </a>
            {parts[1]}
          </p>
        )
      }
    }

    if (cardText.descriptionElement === "OFFCHAIN_STANDARD") {
      return (
        <p className="text-sm text-center text-secondary-foreground">
          This proposal requires approval from the Citizen&#39;s House and Token
          House. Read more about the voting mechanism{" "}
          <a
            href="https://github.com/ethereum-optimism/OPerating-manual/blob/main/manual.md"
            className="text-sm text-center underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      )
    }

    if (cardText.descriptionElement) {
      if (React.isValidElement(cardText.descriptionElement)) {
        return React.cloneElement(
          cardText.descriptionElement as React.ReactElement<{
            className?: string
          }>,
          {
            className:
              "text-sm text-center text-[#404454] font-weight-normal",
          },
        )
      } else {
        return (
          <p className="text-sm text-center text-[#404454] font-weight-normal">
            {cardText.descriptionElement}
          </p>
        )
      }
    }

    return null
  }

  return (
    <div className="flex flex-col text-center gap-2 p-6">
      <h4 className="text-md font-semibold">{cardText.title}</h4>
      {renderDescription()}
    </div>
  )
}

export { CardText, type CardTextProps }
