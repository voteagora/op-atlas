import React from "react"

interface ProposalTitleProps {
  title: string
}

const ProposalTitle = ({ title }: ProposalTitleProps) => (
  <div className="gap-2 flex-col items-start">
    <h1 className="font-normal text-xl sm:text-2xl md:text-3xl lg:text-[36px] leading-tight lg:leading-[44px] tracking-normal text-text-default font-riforma break-words word-break overflow-wrap-anywhere">
      {title}
    </h1>
  </div>
)

interface ProposalStatusProps {
  status: string
  startDate?: string
  endDate?: string
  className?: string
}

const ProposalStatus = ({
  status,
  startDate,
  endDate,
  className = "",
}: ProposalStatusProps) => (
  <div className={`text-h2 ${className} flex flex-col gap-3`}>
    {startDate && endDate && (
      <div className="font-riforma font-normal text-sm md:text-[16px] leading-5 md:leading-[24px] tracking-[0%] text-secondary-foreground mt-1 max-w-full">
        <span className="break-all overflow-hidden text-ellipsis">
          Voting {startDate} - {endDate}
        </span>
      </div>
    )}
  </div>
)

const ProposalHeader = ({
  title,
  status,
  startDate,
  endDate,
}: {
  title: string
  status: string
  startDate?: string
  endDate?: string
}) => {
  return (
    <div className="flex flex-col gap-4 md:gap-8 w-full">
      <div className="flex flex-col gap-4 md:gap-5">
        <ProposalTitle title={title} />
        <ProposalStatus
          status={status}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      <div className="flex">
        <div className="divider border-t w-full" />
      </div>
    </div>
  )
}

export default ProposalHeader
