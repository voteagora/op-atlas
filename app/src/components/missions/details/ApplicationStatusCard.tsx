"use client"

import { format } from "date-fns"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import ExtendedLink from "@/components/common/ExtendedLink"
import { MissionData } from "@/lib/MissionsAndRoundData"

import { useLogin } from "@privy-io/react-auth"
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">{"Apply"}</p>

        <p className="text-sm text-secondary-foreground text-center">
          {`Apply by ${format(
            mission.applyBy,
            "MMM d",
          )} to earn rewards for your performance in ${format(
            new Date(new Date().getFullYear(), mission.evaluationMonth, 1),
            "MMMM",
          )}.`}
        </p>
        <Button
          className="bg-optimismRed text-white w-full"
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

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">{"Apply"}</p>
        {mission.applyBy && (
          <p className="text-sm text-secondary-foreground text-center">
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
          onClick={privyLogin}
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

            <div className="text-sm text-secondary-foreground text-center">
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

            <p className="text-sm text-secondary-foreground text-center">
              {`Apply by ${format(
                mission.applyBy,
                "MMM d",
              )} to earn rewards for your performance in ${format(
                new Date(new Date().getFullYear(), mission.evaluationMonth, 1),
                "MMMM",
              )}.`}
            </p>
            <Button
              className="bg-optimismRed text-white w-full"
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

          <p className="text-sm text-secondary-foreground text-center">
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
