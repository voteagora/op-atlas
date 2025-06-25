import React from "react"

interface ProposalTitleProps {
  title: string
}

const ProposalTitle = ({ title }: ProposalTitleProps) => (
  <div className="gap-2 flex-col items-start">
    <h1 className="font-semibold text-[36px] leading-[44px] tracking-normal text-text-default font-inter">
      {title}
    </h1>
  </div>
)

interface ProposalStatusProps {
  status: string
  className?: string
}

const ProposalStatus = ({ status, className = "" }: ProposalStatusProps) => (
  <div className={`text-h2 ${className}`}>{status}</div>
)

const ProposalHeader = ({
  title,
  status,
}: {
  title: string
  status: string
}) => (
  <div className="flex flex-col gap-[dimensions[8]]">
    <div className="gap-[dimensions[5]]">
      <ProposalTitle title={title} />
      <ProposalStatus status={status} />
    </div>
    <div className="h-[9px] pt-1 pb-1">
      <div className="divider border w-full" />
    </div>
  </div>
)

export default ProposalHeader
