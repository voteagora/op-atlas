"use client"

import { cn } from "@/lib/utils"
import { Account } from "../common/Account"
import { useSession } from "next-auth/react"
import { QRCode, useSignIn } from "@farcaster/auth-kit"

export const Sidebar = ({
  className,
  applyByDate,
  startDate,
}: {
  className?: string
  applyByDate: string
  startDate: string
}) => {
  const { data: session } = useSession()

  console.log(session)

  const { signIn, url } = useSignIn({})

  console.log(url)

  //   const {
  //     signIn,
  //     url
  //     data: { username },
  //     onSuccess: ({ fid }) => console.log("Your fid:", fid);
  //   } = useSignIn();

  async function handleWarpcastSignin() {}

  return (
    <div className={cn("flex flex-col gap-y-6", className)}>
      <div className="flex flex-col items-center justify-center gap-y-3 p-6 border border-2 border-grey-900 rounded-xl">
        <p className="font-bold">Apply</p>

        <p className="text-sm text-secondary-foreground text-center">
          Apply by {applyByDate} to be evaluated for rewards starting{" "}
          {startDate}.
        </p>

        {session ? (
          <p>Logged in!</p>
        ) : (
          <>
            <button onClick={signIn}>Sign In</button>

            {url && (
              <span>
                Scan this: <QRCode uri={url} />
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
