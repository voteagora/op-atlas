"use client"

import { Role } from "@prisma/client"
import { format } from "date-fns"
import ReactMarkdown from 'react-markdown'


export function RoleDetails({ role }: { role: Role }) {


    return (
        <div className="flex flex-col gap-y-8 mt-12">
            <div className="flex flex-col gap-4">
                <div className="text-3xl font-semibold">

                    {role.title}

                </div>
                {role.startAt && role.endAt && (
                    <div className="text-secondary-foreground">
                        Nominations open from {format(new Date(role.startAt), "MMM d, yyyy")} -{" "}
                        {format(new Date(role.endAt), "MMM d, yyyy")}
                    </div>
                )}
            </div>

            <div className="border-b border-border-secondary w-full"></div>

            <div className="flex flex-col gap-6">
                <div className="text-secondary-foreground">
                    <ReactMarkdown>{role.description}</ReactMarkdown>
                </div>
            </div>
        </div>
    )
} 