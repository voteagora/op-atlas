import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { clickSignInWithFarcasterButton } from "@/lib/utils"

import { Button } from "../ui/button"
import { DialogProps } from "./types"

const ELIGIBILITY = [
  "Deployed your onchain contracts on one or multiple of the following OP chains: OP Mainnet, Base, Zora, Mode, Frax, and Metal.",
  "Onchain contracts have interactions from 420 unique addresses during Jan 1st - May 1st 2024.",
  "Onchain contracts had their first transaction before April 1st 2024.",
  "Onchain contracts had more than 10 days of activity during Jan 1st - May 1st 2024.",
  "Verified your onchain contracts in the Retro Funding sign up process.",
  "Made your contract code available in a public Github repo, for which ownership has been verified in the Retro Funding sign up process.",
  "Confirmed that you will comply with Optimism Foundation KYC requirements and are not residing in a sanctioned country.",
  "Submitted a Retro Funding application before June 6th, 2024 and comply with application rules.",
]

export function GetStartedDialog(props: DialogProps<object>) {
  const { status } = useSession()
  const router = useRouter()

  const onGetStarted = () => {
    if (status === "authenticated") {
      router.push("/dashboard")
    } else {
      clickSignInWithFarcasterButton()
    }

    props.onOpenChange(false)
  }

  return (
    <Dialog {...props}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <div className="flex flex-col gap-2 max-h-[calc(80vh_-_48px)]">
          <div className="flex flex-col text-center gap-1">
            <h3>
              Create a profile and add projects to apply for Retro Funding
            </h3>
            <div className="text-secondary-foreground">
              Builders who are eligible for Round 4 have met the following
              criteria:
            </div>
          </div>
          <div className="overflow-hidden relative">
            <div className="absolute z-10 bg-gradient-to-t from-[rgba(251,252,254,0)_0%] to-[#FBFCFE_100%] w-full h-8"></div>
            <div className="overflow-y-auto py-4 pr-2 relative h-full">
              <ul className="list-disc ml-6 text-start text-secondary-foreground">
                {ELIGIBILITY.map((item, i) => (
                  <li className={i > 0 ? "mt-4" : ""} key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute z-10 bottom-0 bg-[linear-gradient(180deg,rgba(251,252,254,0)_0%,#FBFCFE_100%)] w-full h-8"></div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={onGetStarted}
              className="py-3 text-base"
              type="button"
              variant="destructive"
            >
              Get started
            </Button>
            <Button className="py-3 text-base" type="button" variant="outline">
              Learn more
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
