import { Dialog, DialogContent } from "@/components/ui/dialog"

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
  /*
     Ultra jank way to mock clicking on the Farcaster button because SignInButton doesn't
     accept an id or className argument :/
  */
  const onGetStarted = () => {
    const farcasterButton = document
      .getElementsByClassName("fc-authkit-signin-button")[0]
      ?.getElementsByTagName("button")[0]
    farcasterButton?.click()

    props.onOpenChange(false)
  }

  return (
    <Dialog {...props}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <div className="flex flex-col gap-4 max-h-[calc(80vh_-_48px)]">
          <div className="flex flex-col text-center gap-1">
            <h3>Apply for Retro Funding Round 4: Onchain Builders</h3>
            <div className="text-secondary-foreground">
              Create a profile and add projects, then you&apos;ll be able to
              apply for Retro Funding. Builders who are eligible for Round 4
              have met the following criteria:
            </div>
          </div>
          <div className="overflow-y-auto pr-2">
            <ul className="list-disc ml-6 text-start text-secondary-foreground">
              {ELIGIBILITY.map((item, i) => (
                <li className={i > 0 ? "mt-4" : ""} key={item}>
                  {item}
                </li>
              ))}
            </ul>
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
