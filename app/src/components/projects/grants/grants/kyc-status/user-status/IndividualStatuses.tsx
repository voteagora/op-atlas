import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"
import { StatusRow } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"
import { KYCUserStatusProps } from "@/components/projects/types"

const IndividualStatuses = ({ users }: { users: KYCUserStatusProps[] }) => {
  return (
    <KYCSubSection title="Individuals and wallet signers">
      {users.map((user, index) => (
        <StatusRow key={index} {...user} />
      ))}
    </KYCSubSection>
  )
}

export default IndividualStatuses
