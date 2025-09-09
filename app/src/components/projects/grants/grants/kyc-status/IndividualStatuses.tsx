import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"

interface IndividualStatusProps {
  name: string
  email: string
  organization: string
  isUser?: boolean
}

const MOCK_USERS = [
  {
    name: "Shaun Lind",
    email: "shaun@optimism.io",
    organization: "Optimism Unlimited",
  },
]
const IndividualStatuses = () => {
  return (
    <KYCSubSection title="Individuals and wallet Signers">
      {MOCK_USERS.map((user, index) => (
        <IndividualStatus key={index} {...user} isUser={index === 0} />
      ))}
    </KYCSubSection>
  )
}

const IndividualStatus = ({
  name,
  email,
  organization,
  isUser,
}: IndividualStatusProps) => {
  return (
    <>
      <div className={"flex flex-row gap-2"}>
        <div>O</div>
        <div className={"flex flex-row gap-2"}>
          <p>{name}</p>
          <p>{email}</p>
          {organization && <p>{organization}</p>}
        </div>
        {isUser && <div>You</div>}
      </div>
      <p>Resend Email</p>
    </>
  )
}

export default IndividualStatuses
