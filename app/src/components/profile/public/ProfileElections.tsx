import { useEffect, useState } from "react"

import { Button } from "@/components/common/Button"
import { ArrowDownS, FileList2 } from "@/components/icons/reminx"
import { Optimism } from "@/components/icons/socials"
import { useActiveUserApplications } from "@/hooks/role/useActiveUserApplications"
import { useRole } from "@/hooks/role/useRole"
import { useUsername } from "@/hooks/useUsername"
import { UserWithAddresses } from "@/lib/types"
import { formatMMMd } from "@/lib/utils/date"

// Utility function to strip markdown from text
const stripMarkdown = (text: string): string => {
    return text
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // Remove strikethrough
        .replace(/~~(.*?)~~/g, '$1')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove list markers
        .replace(/^[\s]*[-*+]\s+/gm, '')
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // Clean up extra whitespace
        .replace(/\n\s*\n/g, '\n')
        .trim()
}

export default function ProfileElections({ user }: { user: UserWithAddresses }) {
    const [roleId, setRoleId] = useState<number | null>(null)

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

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium">Elections</h2>

            <div className="flex flex-col gap-6 border border-border-secondary rounded-lg p-4">
                <div className="flex flex-row gap-4">
                    <div><Optimism className="w-[48px] h-[48px]" fill="#FF0000" /></div>
                    <div>
                        <div className="font-semibold">{role.title}</div>
                        <div className="text-muted-foreground">Season 8 | Voting ends {formatMMMd(new Date(role.voteStartAt!))} - {formatMMMd(new Date(role.voteEndAt!))}</div>
                    </div>
                </div>
                <div className="text-secondary-foreground line-clamp-3">
                    {cleanDescription}
                </div>
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-2 text-secondary-foreground items-center">
                        <FileList2 className="w-4 h-4" fill="#000" />
                        <div>{`View ${username}'s application`}</div>
                        <ArrowDownS className="w-4 h-4" fill="#000" />
                    </div>
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
        </div>
    )
}