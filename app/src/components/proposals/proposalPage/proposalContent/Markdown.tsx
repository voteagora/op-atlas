import React from "react"
import ReactMarkdown from "react-markdown"

interface ProposalContentProps {
  description: string
}

const Markdown = ({ description }: ProposalContentProps) => (
  <ReactMarkdown>{description}</ReactMarkdown>
)

export default Markdown
