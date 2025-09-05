import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"
import { StatusRow } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"
import { KYCUserStatusProps } from "@/components/projects/types"

const LegalEntities = ({ 
  users, 
  isAdmin = true 
}: { 
  users: KYCUserStatusProps[]
  isAdmin?: boolean 
}) => {
  return (
    <KYCSubSection title="Legal entities" isAdmin={isAdmin}>
      {users.map((user, index) => (
        <StatusRow key={index} {...user} />
      ))}
    </KYCSubSection>
  )
}

export default LegalEntities
