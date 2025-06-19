import { User } from "@prisma/client"
import { useState } from "react"

import { Button } from "@/components/common/Button"
import { Github } from "@/components/icons/socials"
import { GithubDisplay } from "@/components/profile/GithubDisplay"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"

const RULES = [
  "Please verify that you understand you may be removed from this role via the Representative Removal proposal type in the Operating Manual",
  "Please verify that you understand KYC will be required to receive rewards for this role",
  "Please verify that you understand you may need to sign an agreement with the Foundation prior to onboarding",
  "Please verify that you are able to commit the necessary time to this role",
] as const

export const UserForm = ({ user: initialUser }: { user: User }) => {
  const { user: loadedUser } = useUser({
    id: initialUser.id,
    enabled: true,
  })

  const user = loadedUser || initialUser

  const { linkGithub } = usePrivyLinkGithub(user.id)

  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({})

  const handleCheckboxChange = (index: number) => {
    setCheckedRules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <div className="flex flex-col gap-12 w-full text-foreground">
      <div className="flex flex-col gap-6">
        <div className="text-xl font-semibold">
          Connect your GitHub account to show your code contributions to the
          Optimism Collective
        </div>
        {user.github ? (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-foreground">Your GitHub account</div>
            <div>
              <GithubDisplay userId={user.id} />
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              linkGithub()
            }}
          >
            <Github className="w-4 h-4 mr-1" fill="#FFFFFF" />
            Connect GitHub
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div className="text-xl font-semibold">
          Confirm the following and link to any relevant projects
        </div>
        <div className="text-foreground">
          If you have any conflicts of interest, please explain them here.
        </div>
        <textarea
          className="w-full min-h-[120px] p-3 border border-border rounded-md bg-background text-foreground text-sm resize-none focus:outline-none "
          placeholder="Explain your conflicts of interest (optional)"
          rows={3}
          maxLength={280}
        />

        <div className="flex flex-col gap-6">
          {RULES.map((rule, index) => (
            <div key={index} className="flex flex-col gap-6">
              <div className="text-foreground">{rule}</div>
              <div className="flex flex-row gap-2">
                <Checkbox
                  className="self-start mt-0.5"
                  id={`rule-${index}`}
                  checked={checkedRules[index] || false}
                  onCheckedChange={() => handleCheckboxChange(index)}
                />
                <label
                  htmlFor={`rule-${index}`}
                  className="text-sm font-medium text-foreground"
                >
                  I understand
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="text-foreground">
          Which projects demonstrate your expertise in this area?
          <div className="text-muted-foreground">
            Choose from your projects in Atlas. If your project isn’t in Atlas,
            then add your project before continuing here. To join a project or
            organization that already exists in Atlas, please have their admin
            add you.{" "}
          </div>
        </div>
      </div>
    </div>
  )
}
