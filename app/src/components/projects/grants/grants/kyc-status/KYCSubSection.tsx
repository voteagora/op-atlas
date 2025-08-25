import { ReactNode } from "react"

interface KYCSubSectionProps {
  title: string
  children: ReactNode
}

const KYCSubSection = ({ title, children }: KYCSubSectionProps) => {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="font-[Inter] font-medium text-[14px] leading-[20px] text-text-foreground">
        {title}
      </p>
      <div className="flex flex-row w-[664px] h-[40px] pt-[10px] pr-[12px] pb-[10px] pl-[12px] gap-[8px] rotate-0 opacity-100 rounded-[6px] border border-border bg-background">
        {children}
      </div>
    </div>
  )
}

export default KYCSubSection
