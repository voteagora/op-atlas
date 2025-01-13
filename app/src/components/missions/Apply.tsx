"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useSession } from "next-auth/react"

export const Apply = ({
  className,
  applyByDate,
  startDate,
  userProjectCount,
}: {
  className?: string
  applyByDate: string
  startDate: string
  userProjectCount: number
}) => {
  const router = useRouter()

  const { data } = useSession()

  return (
    <div className="flex flex-col items-center justify-center gap-y-3 p-6 border border-2 border-grey-900 rounded-xl">
      <p className="font-bold">
        {!data || userProjectCount > 0 ? "Apply" : "Add project to apply"}{" "}
      </p>

      <p className="text-sm text-secondary-foreground text-center">
        {!data || userProjectCount > 0 ? (
          <p>
            {`Apply by ${applyByDate} to be evaluated for rewards starting 
              ${startDate}`}
            .
          </p>
        ) : (
          <p>
            {
              "You can’t apply for this Retro Funding Mission until you’ve added your project to OP Atlas."
            }
          </p>
        )}
      </p>
      {!data ? (
        <Button className="bg-optimismRed text-white" variant={"outline"}>
          Sign up or sign in
        </Button>
      ) : userProjectCount > 0 ? (
        <Button className="bg-optimismRed text-white" variant={"outline"}>
          Apply
        </Button>
      ) : (
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
      )}
    </div>
  )
}
