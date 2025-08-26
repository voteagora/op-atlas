import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"
import { StatusRow, StatusType } from "@/components/projects/grants/grants/kyc-status/user-status/StatusComponents"

interface IndividualStatusProps {
  name: string
  email: string
  organization: string
  isUser?: boolean
  status?: StatusType
}

const MOCK_USERS = [
  {
    name: "Shaun Lind",
    email: "shaun@optimism.io",
    organization: "Optimism Unlimited",
    status: "pending" as StatusType,
  },
  {
    name: "Alex Johnson",
    email: "alex@optimism.io",
    organization: "Optimism Unlimited",
    status: "completed" as StatusType,
  },
  {
    name: "Jamie Smith",
    email: "jamie@optimism.io",
    organization: "Optimism Unlimited",
    status: "needs_review" as StatusType,
  },
  {
    name: "Taylor Brown",
    email: "taylor@optimism.io",
    organization: "Optimism Unlimited",
    status: "approved" as StatusType,
  },
  {
    name: "Morgan Lee",
    email: "morgan@optimism.io",
    organization: "Optimism Unlimited",
    status: "declined" as StatusType,
  },
]
const IndividualStatuses = () => {
  return (
    <KYCSubSection title="Individuals and wallet Signers">
      {MOCK_USERS.map((user, index) => (
        <StatusRow key={index} {...user} isUser={index === 0} />
      ))}
    </KYCSubSection>
  )
}

export default IndividualStatuses
