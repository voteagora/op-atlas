import { type Role as RoleType } from "@/db/role"

export function Role({ role }: { role: RoleType }) {
  return (
    <div
      key={role.id}
      className="rounded-xl border border-border-secondary p-6 bg-background hover:bg-accent/50 transition-colors"
    >
      <div className="flex flex-col gap-2">
        <div className="text-xl font-medium">{role.title}</div>
        {role.description && (
          <div className="text-secondary-foreground">{role.description}</div>
        )}
        {role.link && (
          <a
            href={role.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Learn more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}
