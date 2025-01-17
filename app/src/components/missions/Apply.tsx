"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Check, Loader, Loader2 } from "lucide-react"
import { Badge } from "../ui/badge"
import { format } from "date-fns"

export const Apply = ({
  className,
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

  const pendingBadge = (
    <Badge
      className={`text-xs font-medium text-blue-800 border-0 ${"bg-calloutAlternative-foreground"} flex gap-1`}
      variant={"outline"}
    >
      <Loader2 width={12} height={12} />
      Pending
    </Badge>
  )

  const activeBadge = (
    <Badge
      className={`text-xs font-medium text-green-800 border-0 bg-green-100 flex gap-1`}
      variant={"outline"}
    >
      <Check width={12} height={12}></Check>
      Enrolled
    </Badge>
  )

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

        <Button className="bg-optimismRed text-white" variant={"outline"}>
          Sign up or sign in
        </Button>
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

                <Button variant={"ghost"} className="bg-secondary mt-5">
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
