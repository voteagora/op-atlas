import { OrganizationKYCTeam, KYCTeam, Project, KYCUser, RewardStream } from "@prisma/client"
import KYCSubSection from "@/components/projects/grants/grants/kyc-status/KYCSubSection"

type KYCTeamWithProjects = OrganizationKYCTeam & {
  team: KYCTeam & {
    projects: Project[]
    team: {
      users: KYCUser[]
    }[]
    rewardStreams: RewardStream[]
  }
}

const ConnectedOrganizationProjects = ({
  kycTeam,
  hasActiveStream = false,
  isAdmin = true,
}: {
  kycTeam: KYCTeamWithProjects
  hasActiveStream?: boolean
  isAdmin?: boolean
}) => {
  console.log({ kycTeam, ln: kycTeam?.team.projects.length })
  return (
    <KYCSubSection
      title="Projects"
      kycTeamId={kycTeam?.kycTeamId}
      organizationId={kycTeam?.organizationId}
      hasActiveStream={hasActiveStream}
      isAdmin={isAdmin}
    >
      <div className="space-y-2">
        {kycTeam && kycTeam?.team.projects.length > 0 ? (
          kycTeam.team.projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))
        ) : (
          <div>No projects selected</div>
        )}
      </div>
    </KYCSubSection>
  )
}

const ProjectRow = ({ project }: { project: Project }) => {
  return (
    <div className="flex flex-row items-center justify-between py-2 px-3 gap-2 border rounded-md">
      <div className="flex flex-row gap-2">
        <div className="w-6 h-6">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              className="w-full h-full object-cover rounded-sm"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-sm"></div>
          )}
        </div>
        <p className="font-riforma text-sm font-normal leading-5">
          {project.name}
        </p>
      </div>
    </div>
  )
}

export default ConnectedOrganizationProjects
