import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"
import { StatusRow } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"
import { PersonaStatus } from "@/components/projects/types"

const MOCK_USERS = [
  {
    name: "Optimism Foundation",
    email: "legal@optimism.io",
    organization: "Optimism Unlimited",
    status: "created" as PersonaStatus,
  },
  {
    name: "Ethereum Foundation",
    email: "legal@ethereum.org",
    organization: "Ethereum",
    status: "expired" as PersonaStatus,
  },
  {
    name: "Web3 Alliance",
    email: "legal@web3alliance.org",
    organization: "Web3 Alliance",
    status: "failed" as PersonaStatus,
  },
]

const LegalEntities = () => {
  return (
    <KYCSubSection title="Legal entities">
      {MOCK_USERS.map((user, index) => (
        <StatusRow key={index} {...user} />
      ))}
    </KYCSubSection>
  )
}

export default LegalEntities
