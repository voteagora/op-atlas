import { ReactNode } from "react"

interface KYCSubSectionProps {
  title: string
  children: ReactNode
}

const KYCSubSection = ({ title, children }: KYCSubSectionProps) => {
  return (
    <div className="flex flex-col gap-[8px] max-w-[664px]">
      <p className="font-[Inter] font-medium text-[14px] leading-[20px] text-text-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-[12px]">{children}</div>
    </div>
  )
}

export default KYCSubSection
