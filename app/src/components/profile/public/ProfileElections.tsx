import Image from "next/image"
import { useEffect, useState } from "react"

import { Button } from "@/components/common/Button"
import { ArrowDownS, ArrowUpS, FileList2 } from "@/components/icons/reminx"
import { Optimism } from "@/components/icons/socials"
import { Avatar, AvatarBadge } from "@/components/ui/avatar"
import { useProject } from "@/hooks/db/useProject"
import { useActiveUserApplications } from "@/hooks/role/useActiveUserApplications"
import { useRole } from "@/hooks/role/useRole"
import { useUsername } from "@/hooks/useUsername"
import { UserWithAddresses } from "@/lib/types"
import { formatMMMd, formatMMMdyyyy } from "@/lib/utils/date"
import { stripMarkdown } from "@/lib/utils/markdown"

export default function ProfileElections({ user }: { user: UserWithAddresses }) {

    const [roleId, setRoleId] = useState<number | null>(null)
    const [expanded, setExpanded] = useState(false)

    const { data: activeApplications, isLoading } = useActiveUserApplications({
        userId: user.id,
        enabled: !!user.id,
    })

    const username = useUsername(user)


    const { data: role, isLoading: isLoadingRole } = useRole({
        id: roleId!,
        enabled: !!roleId,
    })

    useEffect(() => {
        if (activeApplications && activeApplications.length > 0) {
            setRoleId(activeApplications[0].roleId)
        }
    }, [activeApplications])

    if (isLoading || !activeApplications || activeApplications.length === 0 || isLoadingRole || !role) return null

    const cleanDescription = stripMarkdown(role.description || "");

    const renderApplication = () => {


        if (expanded) {
            return (
                <div className="flex flex-col gap-6 mb-6">
                    <div className="border-t border-border-secondary my-4"></div>
                    <div>{`${username}'s self nomination`}</div>
                    <div>Which of your projects demonstrate your expertise?</div>

                    {JSON.parse(activeApplications[0].application).projects.map((project: any, idx: number) => (
                        <ProjectDedetails key={idx} projectApplication={project} />
                    ))}
                </div>
            )
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium">Elections</h2>

            <div className="flex flex-col gap-6 border border-border-secondary rounded-lg p-6">
                <div className="flex flex-row gap-5">
                    <Avatar>
                        <Optimism className="w-[48px] h-[48px]" fill="#FF0000" />
                        {user.imageUrl &&
                            <AvatarBadge className="absolute w-[24px] h-[24px] top-[14px] right-0 bg-white rounded-full">
                                <Image src={user.imageUrl} alt="user" width={24} height={24} className="rounded-full" />
                            </AvatarBadge>
                        }
                    </Avatar>
                    <div>
                        <div>Candidate for {role.title}</div>
                        <div className="text-muted-foreground">Season 8 <span className="text-muted">|</span> Voting {formatMMMd(new Date(role.voteStartAt!))} - {formatMMMd(new Date(role.voteEndAt!))}</div>
                    </div>
                </div>
                <div className={`text-muted-foreground ${!expanded ? ' line-clamp-3' : ''}`}>
                    {cleanDescription}
                </div>
                {renderApplication()}
                <div className="flex flex-row justify-between items-center">
                    <button
                        type="button"
                        className="flex flex-row gap-2 text-secondary-foreground items-center focus:outline-none"
                        onClick={() => setExpanded((prev) => !prev)}
                    >
                        <FileList2 className="w-4 h-4" fill="#000" />
                        <div>{expanded ? `Hide ${username}'s application` : `View ${username}'s application`}</div>
                        {expanded ? <ArrowUpS className="w-4 h-4" fill="#000" /> : <ArrowDownS className="w-4 h-4" fill="#000" />}
                    </button>
                    <div className="flex flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => role.link && window.open(role.link, '_blank')}
                        >
                            View discussion
                        </Button>
                        <Button
                            onClick={() => role.link && window.open('/governance', '_blank')}
                        >
                            Vote
                        </Button>
                    </div>
                </div>

            </div>
        </div >
    )
}


const ProjectDedetails = ({ projectApplication }: {
    projectApplication: {
        projectId: string,
        projectName: string,
        description: string
    }
}) => {

    const { projectId, projectName, description } = projectApplication

    const { data: project } = useProject({ id: projectId, enabled: true })

    if (!project) return null

    return <div className="flex flex-col gap-6">
        <div className="flex flex-row gap-2 items-center">
            {project.thumbnailUrl && (
                <Image
                    src={project.thumbnailUrl}
                    alt={project.name}
                    width={24}
                    height={24}
                    className="rounded-md"
                />
            )}
            <div>
                {project.name} <span className="text-muted-foreground">{formatMMMdyyyy(new Date(project.createdAt))} - {project.deletedAt ? formatMMMdyyyy(new Date(project.deletedAt)) : 'Present'}</span>
            </div>
        </div >
        <div className="text-muted-foreground">{description}</div>
    </div>
}