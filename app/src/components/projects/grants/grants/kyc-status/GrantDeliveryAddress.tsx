import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"

const GrantDeliveryAddress = ({ address }: { address: string }) => {
  return (
    <KYCSubSection title="Grant delivery address">
      <div className="gap-2 max-w-[664px] h-[40px]">
        <div className="flex flex-row px-3 py-[10px] gap-2 rotate-0 opacity-100 rounded-[6px] border border-border bg-background">
          <p className="font-riforma font-normal text-[14px] leading-[20px]">
            {address}
          </p>
        </div>
      </div>
    </KYCSubSection>
  )
}

export default GrantDeliveryAddress
