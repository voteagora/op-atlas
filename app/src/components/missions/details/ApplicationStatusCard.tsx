"use client"

import { useLogin } from "@privy-io/react-auth"
import { format } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import ExtendedLink from "@/components/common/ExtendedLink"
import { MissionData } from "@/lib/MissionsAndRoundData"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { Button } from "../../ui/button"
import { GreenBadge } from "../common/badges/GreenBadge"

export const ApplicationStatusCard = ({
  isLoading,
  mission,
  userProjectCount,
  userAppliedProjects,
}: {
  isLoading?: boolean
  mission: MissionData
  userProjectCount?: number
  userAppliedProjects: { icon: string | null; name: string }[] | undefined
}) => {
  const router = useRouter()

  const { login: privyLogin } = useLogin()

  const { data } = useSession()

  const { track } = useAnalytics()
  const applyBy = mission.applyBy as Date
  const buttonClickHandler = ({
    href,
    text,
    type,
  }: {
    href: string
    text: string
    type: string
  }) => {
    track("Link Click", {
      href,
      text,
      type,
      elementType: "Button",
      elementName: text,
    })
  }

  if (mission?.pageName === "growth-grants") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold hidden md:block">{"Apply"}</p>

        <p className="text-sm text-secondary-foreground text-center mb-2">
          Visit the Grants Council website to learn more and apply.
        </p>
        <Button
          className="bg-optimismRed text-white w-full border-0"
          variant={"outline"}
          onClick={() => {
            buttonClickHandler({
              href: "https://app.opgrants.io/programs/959/apply",
              text: "Apply",
              type: "application",
            })
            window.open(
              "https://app.opgrants.io/programs/959/apply",
              "_blank",
              "noopener,noreferrer",
            )
          }}
        >
          Apply via Grants Council
        </Button>
      </div>
    )
  } else if (mission?.pageName === "audit-grants") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold hidden md:block">
          Find an Audit Service Provider
        </p>

        <p className="text-sm text-secondary-foreground text-center mb-2">
          Get in contact with an ASP, and they&apos;ll apply on your behalf.
        </p>
        <Button
          className="bg-optimismRed text-white w-full border-0"
          variant={"outline"}
          onClick={() => {
            buttonClickHandler({
              href: "https://hackmd.io/@wbnns/superchain-audit-service-providers",
              text: "View ASPs",
              type: "application",
            })
            window.open(
              "https://hackmd.io/@wbnns/superchain-audit-service-providers",
              "_blank",
              "noopener,noreferrer",
            )
          }}
        >
          View ASPs
        </Button>
      </div>
    )
  } else if (mission?.pageName === "foundation-missions") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold hidden md:block">Explore missions</p>

        <p className="text-sm text-secondary-foreground text-center mb-2">
          View missions in the Optimism GitHub Repo
        </p>
        <Button
          className="bg-optimismRed text-white w-full border-0"
          variant={"outline"}
          onClick={() => {
            buttonClickHandler({
              href: "https://github.com/orgs/ethereum-optimism/projects/31/views/1",
              text: "Explore missions",
              type: "application",
            })
            window.open(
              "https://github.com/orgs/ethereum-optimism/projects/31/views/1",
              "_blank",
              "noopener,noreferrer",
            )
          }}
        >
          Visit GitHub
        </Button>
      </div>
    )
  } else if (mission?.pageName === "governance-fund-missions") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold hidden md:block">Explore missions</p>

        <p className="text-sm text-secondary-foreground text-center mb-2">
          View opportunities in the Optimism Governance Forum via the Mission
          Request section
        </p>
        <Button
          className="bg-optimismRed text-white w-full border-0"
          variant={"outline"}
          onClick={() => {
            buttonClickHandler({
              href: "https://gov.optimism.io/tag/mission-request",
              text: "Visit forum",
              type: "application",
            })
            window.open(
              "https://gov.optimism.io/tag/mission-request",
              "_blank",
              "noopener,noreferrer",
            )
          }}
        >
          Visit forum
        </Button>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">{"Apply"}</p>

        <p className="text-sm text-secondary-foreground text-center mb-2">
          {`Apply by ${format(
            applyBy,
            "MMM d",
          )} to earn rewards for your performance in ${format(
            new Date(new Date().getFullYear(), mission.evaluationMonth, 1),
            "MMMM",
          )}.`}
        </p>
        <Button
          className="bg-optimismRed text-white w-full border-0"
          variant={"outline"}
          onClick={() => {
            buttonClickHandler({
              href: `/missions/${mission.pageName}/application`,
              text: "Choose projects",
              type: "application",
            })
            router.push(`/missions/${mission.pageName}/application`)
          }}
        >
          Choose projects
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">{"Apply"}</p>
        {mission.applyBy && (
          <p className="text-sm text-secondary-foreground text-center mb-2">
            {`Apply by ${format(mission.applyBy, "MMM d")}`}
            <span>
              {" to earn rewards for your performance in "}
              {format(
                new Date(new Date().getFullYear(), mission.evaluationMonth, 1),
                "MMMM",
              )}
              {"."}
            </span>
          </p>
        )}

        <Button
          variant={"destructive"}
          className="w-full flex gap-2"
          onClick={() => {
            buttonClickHandler({
              href: "",
              text: "Sign in",
              type: "application",
            })
            privyLogin()
          }}
        >
          Sign in or sign up
        </Button>
      </div>
    )
  } else {
    if (userProjectCount && userProjectCount > 0) {
      if (userAppliedProjects && userAppliedProjects?.length > 0) {
        return (
          <div className="flex flex-col gap-4">
            <p className="font-semibold">{"Your status"}</p>

            <div className="text-sm text-secondary-foreground text-center mb-2">
              <div className="flex flex-col gap-2">
                {userAppliedProjects.map(
                  (
                    element: { icon: string | null; name: string },
                    index: number,
                  ) => {
                    return (
                      <div
                        key={"userAppliedProject" + index}
                        className="flex items-center gap-2"
                      >
                        <Image
                          src={
                            element.icon ??
                            "/assets/images/social-share-background.png"
                          }
                          width={32}
                          height={32}
                          alt="Project"
                          className="rounded-lg object-cover"
                        />
                        <p className="flex-1 truncate text-left text-sm pr-3">
                          {element.name}
                        </p>

                        <GreenBadge />
                      </div>
                    )
                  },
                )}

                <Button
                  variant={"ghost"}
                  className="bg-secondary mt-5 w-full"
                  onClick={() => {
                    router.push(`/missions/${mission.pageName}/application`)
                  }}
                >
                  Apply with more projects
                </Button>
              </div>
            </div>
          </div>
        )
      } else {
        return (
          <div className="flex flex-col items-center gap-2">
            <p className="font-semibold">{"Apply"}</p>

            <p className="text-sm text-secondary-foreground text-center mb-2">
              {`Apply by ${format(
                applyBy,
                "MMM d",
              )} to earn rewards for your performance in ${format(
                new Date(new Date().getFullYear(), mission.evaluationMonth, 1),
                "MMMM",
              )}.`}
            </p>
            <Button
              className="bg-optimismRed text-white w-full border-0"
              variant={"outline"}
              onClick={() => {
                router.push(`/missions/${mission.pageName}/application`)
              }}
            >
              Choose projects
            </Button>
          </div>
        )
      }
    } else {
      return (
        <div className="flex flex-col items-center gap-2">
          <p className="font-semibold">{"Add project to apply"}</p>

          <p className="text-sm text-secondary-foreground text-center mb-2">
            {
              "You can't apply for this Retro Funding Mission until you've added your project to OP Atlas."
            }
          </p>

          <div className="flex flex-col w-full gap-2">
            <div>
              <div>
                <ExtendedLink
                  as="button"
                  href="/projects/new"
                  text="Add Project"
                  variant="primary"
                  className="w-full"
                />
              </div>
            </div>
            <Button
              variant={"ghost"}
              onClick={() => {
                router.push("/dashboard")
              }}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      )
    }
  }
}
