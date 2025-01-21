"use client"

import { useRouter } from "next/navigation"
import { Button } from "../../ui/button"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { format } from "date-fns"
import { GreenBadge } from "../common/badges/GreenBadge"
import { Account } from "@/components/common/Account"

export const ApplicationStatusCard = ({
  applyByDate,
  startDate,
  userProjectCount,
  userAppliedProjects,
  pageName,
}: {
  className?: string
  applyByDate: string | undefined
  startDate: string
  userProjectCount: number
  userAppliedProjects: { icon: string | null; name: string }[]
  pageName?: string
}) => {
  const router = useRouter()

  const { data } = useSession()

  const activeBadge = <GreenBadge />

  console.log(userAppliedProjects)

  let result
  if (!data) {
    result = (
      <>
        <p className="font-bold">{"Apply"}</p>

        {applyByDate && (
          <p className="text-sm text-secondary-foreground text-center">
            {`Apply by ${format(
              applyByDate,
              "MMM d",
            )} to be evaluated for rewards starting 
          ${format(startDate, "MMM d")}.`}
          </p>
        )}

        <Account />
      </>
    )
  } else {
    if (userProjectCount > 0) {
      if (userAppliedProjects && userAppliedProjects?.length > 0) {
        result = (
          <>
            <p className="font-bold">{"Your status"}</p>

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
                        className="flex items-center gap-1"
                      >
                        {element.icon ? (
                          <Image
                            src={element.icon}
                            width={32}
                            height={32}
                            alt="Project"
                          />
                        ) : (
                          <></>
                        )}
                        <p className="overflow-hidden truncate">
                          {element.name}
                        </p>
                        {/* {element.status == "Pending" ? pendingBadge : activeBadge} */}
                        {activeBadge}
                      </div>
                    )
                  },
                )}

                <Button
                  variant={"ghost"}
                  className="bg-secondary mt-5"
                  onClick={() => {
                    router.push(`/missions/${pageName}/application`)
                  }}
                >
                  Apply with more projects
                </Button>
              </div>
            </div>
          </>
        )
      } else {
        result = (
          <>
            <p className="font-bold">{"Apply"}</p>

            <p className="text-sm text-secondary-foreground text-center">
              {`Apply by ${applyByDate} to be evaluated for rewards starting 
            ${startDate}.`}
            </p>
            <Button
              className="bg-optimismRed text-white"
              variant={"outline"}
              onClick={() => {
                router.push(`/missions/${pageName}/application`)
              }}
            >
              Apply
            </Button>
          </>
        )
      }
    } else {
      result = (
        <>
          <p className="font-bold">{"Add project to apply"}</p>

          <p className="text-sm text-secondary-foreground text-center">
            {
              "You can’t apply for this Retro Funding Mission until you’ve added your project to OP Atlas."
            }
          </p>

          <div className="flex flex-col w-full gap-2">
            <Button className="bg-optimismRed text-white" variant={"outline"}>
              Add Project
            </Button>
            <Button
              variant={"ghost"}
              onClick={() => {
                router.push("/dashboard")
              }}
            >
              View Dashboard
            </Button>
          </div>
        </>
      )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-3 p-6 border border-2 border-grey-900 rounded-xl">
      {result}
    </div>
  )
}
