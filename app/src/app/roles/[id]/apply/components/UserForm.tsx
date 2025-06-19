import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/common/Button"
import { Github } from "@/components/icons/socials"
import { GithubDisplay } from "@/components/profile/GithubDisplay"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { useApplyForRole } from "@/hooks/role/useApplyForRole"

const TERMS = [
  "Please verify that you understand you may be removed from this role via the Representative Removal proposal type in the Operating Manual",
  "Please verify that you understand KYC will be required to receive rewards for this role",
  "Please verify that you understand you may need to sign an agreement with the Foundation prior to onboarding",
  "Please verify that you are able to commit the necessary time to this role",
] as const

type SelectedEntity = {
  name: string
  avatar?: string
  userId?: string
  organizationId?: string
}

export const UserForm = ({
  user: initialUser,
  roleId,
  selectedEntity,
}: {
  user: User
  roleId: number
  selectedEntity: SelectedEntity
}) => {
  const { user: loadedUser } = useUser({
    id: initialUser.id,
    enabled: true,
  })

  const user = loadedUser || initialUser
  const router = useRouter()
  const { linkGithub } = usePrivyLinkGithub(user.id)
  const { applyForRole, isLoading, isSuccess } = useApplyForRole()

  const [checkedRules, setCheckedRules] = useState<Record<number, boolean>>({})
  const [conflictsOfInterest, setConflictsOfInterest] = useState("")

  const handleCheckboxChange = (index: number) => {
    setCheckedRules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const allTermsChecked = TERMS.every((_, index) => checkedRules[index])

  const handleSubmit = () => {
    applyForRole(roleId, {
      userId: selectedEntity.userId,
      organizationId: selectedEntity.organizationId,
      application: JSON.stringify({
        params: "all good",
      }),
    })
  }

  // Redirect on success
  if (isSuccess) {
    router.push(`/roles/${roleId}`)
    return null
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
          className="w-full p-3 border border-border rounded-md bg-background text-foreground text-sm resize-none focus:outline-none "
          placeholder="Explain your conflicts of interest (optional)"
          rows={5}
          maxLength={280}
          value={conflictsOfInterest}
          onChange={(e) => setConflictsOfInterest(e.target.value)}
        />

        <div className="flex flex-col gap-6">
          {TERMS.map((term, index) => (
            <div key={index} className="flex flex-col gap-6">
              <div className="text-foreground">{term}</div>
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
            Choose from your projects in Atlas. If your project isn&apos;t in
            Atlas, then add your project before continuing here. To join a
            project or organization that already exists in Atlas, please have
            their admin add you.{" "}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="button-primary"
          disabled={!allTermsChecked || !user.github || isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  )
}
