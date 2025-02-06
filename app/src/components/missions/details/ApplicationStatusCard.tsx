"use client"

import { format } from "date-fns"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Account } from "@/components/common/Account"
import ExtendedLink from "@/components/common/ExtendedLink"
import { clickSignInWithFarcasterButton } from "@/lib/utils"

import { Button } from "../../ui/button"
import { GreenBadge } from "../common/badges/GreenBadge"

export const ApplicationStatusCard = ({
  isLoading,
  applyByDate,
  rewardsDate,
  userProjectCount,
  userAppliedProjects,
  pageName,
}: {
  isLoading?: boolean
  applyByDate: string | undefined
  rewardsDate: string | undefined
  userProjectCount?: number
  userAppliedProjects: { icon: string | null; name: string }[] | undefined
  pageName?: string
}) => {
  const router = useRouter()

  const { data } = useSession()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">{"Apply"}</p>

        <p className="text-sm text-secondary-foreground text-center">
          {`Apply by ${applyByDate} to earn rewards for your performance in February.`}
        </p>
        <Button
          className="bg-optimismRed text-white w-full"
          variant={"outline"}
          onClick={() => {
            router.push(`/missions/${pageName}/application`)
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
        {applyByDate && (
          <p className="text-sm text-secondary-foreground text-center">
            {`Apply by ${format(applyByDate, "MMM d")}`}
            <span>{" to earn rewards for your performance in February."}</span>
          </p>
        )}

        <Button
          variant={"destructive"}
          className="w-full flex gap-2"
          onClick={clickSignInWithFarcasterButton}
        >
          <Image
            width={16}
            height={16}
            src={"/assets/icons/farcaster-icon-white.svg"}
            alt=""
          />
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
                        key={"userAppliedProject-" + index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 w-3/4">
                          {element.icon ? (
                            <Image
                              src={element.icon}
                              width={32}
                              height={32}
                              alt="Project"
                              className="rounded-lg"
                            />
                          ) : (
                            <></>
                          )}
                          <p className="overflow-hidden truncate">
                            {element.name}
                          </p>
                        </div>

                        <GreenBadge />
                      </div>
                    )
                  },
                )}

                <Button
                  variant={"ghost"}
                  className="bg-secondary mt-5 w-full"
                  onClick={() => {
                    router.push(`/missions/${pageName}/application`)
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
              {`Apply by ${applyByDate} to earn rewards for your performance in February.`}
            </p>
            <Button
              className="bg-optimismRed text-white w-full"
              variant={"outline"}
              onClick={() => {
                router.push(`/missions/${pageName}/application`)
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
              "You can’t apply for this Retro Funding Mission until you’ve added your project to OP Atlas."
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
