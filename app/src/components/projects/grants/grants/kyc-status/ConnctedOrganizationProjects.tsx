import { Project } from "@prisma/client"

import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"

const ConnectedOrganizationProjects = ({
  projects,
}: {
  projects: Project[]
}) => {
  console.log({ projects })
  return (
    <KYCSubSection title="Projects">
      <div></div>
    </KYCSubSection>
  )
}

export default ConnectedOrganizationProjects
