"use client"

import { Role } from "@prisma/client"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"

export function RoleDetails({ role }: { role: Role }) {
  return (
    <div className="flex flex-col gap-y-8 mt-12">
      <div className="flex flex-col gap-4">
        <div className="text-3xl font-semibold">{role.title}</div>
        {role.startAt && role.endAt && (
          <div className="text-muted-foreground">
            Nominations {format(new Date(role.startAt), "MMM d, yyyy")} -{" "}
            {format(new Date(role.endAt), "MMM d, yyyy")}
          </div>
        )}
      </div>

      <div className="border-b border-border-secondary w-full"></div>

      <div className="flex flex-col gap-6">
        <div className="text-secondary-foreground">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-6 last:mb-0">{children}</p>,

              h3: ({ children }) => (
                <h3 className="text-2xl text-semibold my-6">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xl text-semibold my-6">{children}</h4>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
            }}
          >
            {role.description}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
