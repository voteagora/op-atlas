import React from "react"
import ReactMarkdown from "react-markdown"

interface ProposalContentProps {
  description: string
}

const ProposalContent = ({ description }: ProposalContentProps) => (
  <ReactMarkdown>{description}</ReactMarkdown>
)

export default ProposalContent
