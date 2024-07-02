import { isAfter } from "date-fns"
import { ArrowUpRight, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { isAddress } from "viem"

import {
  addAddressToRewardsClaim,
  completeRewardsClaim,
} from "@/lib/actions/rewards"
import { RewardWithProject } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import ExternalLink from "../ExternalLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"

export function ClaimForm({ reward }: { reward: RewardWithProject }) {
  return (
    <div className="flex flex-col gap-2">
      <ClaimFormAddress reward={reward} />
      <ClaimFormKYC
        reward={reward}
        disabled={!Boolean(reward.claim?.address)}
      />
      <ClaimFormSuperfluid
        reward={reward}
        disabled={
          !Boolean(reward.claim?.address) || reward.claim?.status !== "cleared"
        }
      />
    </div>
  )
}

function ClaimFormAddress({ reward }: { reward: RewardWithProject }) {
  const { data: session } = useSession()
  const [address, setAddress] = useState(reward.claim?.address)

  const { setOpenDialog } = useAppDialogs()

  const [confirmedOnOpMainnet, setConfirmedOnOpMainnet] = useState(
    Boolean(reward.claim?.address),
  )
  const [confirmedCanMakeContractCalls, setConfirmedCanMakeContractCalls] =
    useState(Boolean(reward.claim?.address))

  const [loading, setLoading] = useState(false)
  const [addressError, setAddressError] = useState("")

  const onConfirmAddress = async () => {
    if (!address || !isAddress(address)) {
      setAddressError("Invalid address")
      return
    }
    if (!session?.user?.email) {
      // Ensure we have an email for contacting projects
      setOpenDialog("email")
      return
    }

    setLoading(true)

    try {
      const result = await addAddressToRewardsClaim(reward.id, address)
      if (result.error !== null) {
        setAddressError(result.error)
      } else {
        toast.success("Address confirmed")
      }
    } catch (error) {
      console.error("Error confirming address", error)
      setAddressError("Something went wrong, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-default rounded-xl p-8"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="justify-between">
          <div
            className={cn(
              "flex items-center gap-1 flex-1 text-sm font-medium",
              addressError && "text-red-600",
            )}
          >
            Step 1. Confirm your project&apos;s wallet address
          </div>
          {reward.claim?.address && <Completed />}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-secondary-foreground text-sm">
              Enter an address that can receive funds on OP Mainnet.
            </div>
            <Input
              value={address ?? ""}
              onChange={(e) => {
                setAddress(e.target.value)
                setAddressError("")
              }}
              placeholder="0x..."
            />
            {addressError && (
              <div className="text-red-600 text-sm font-medium">
                {addressError}
              </div>
            )}
            <div className="flex gap-2 items-center">
              <Checkbox
                className="border-2 rounded-[2px]"
                checked={confirmedOnOpMainnet}
                onCheckedChange={() =>
                  setConfirmedOnOpMainnet(!confirmedOnOpMainnet)
                }
              />
              <div className="text-sm text-secondary-foreground">
                I confirm this address is on OP Mainnet
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Checkbox
                className="border-2 rounded-[2px]"
                checked={confirmedCanMakeContractCalls}
                onCheckedChange={() =>
                  setConfirmedCanMakeContractCalls(
                    !confirmedCanMakeContractCalls,
                  )
                }
              />
              <div className="text-sm text-secondary-foreground">
                I confirm this address can make contract calls
              </div>
            </div>
          </div>
          <Button
            disabled={
              !address ||
              !confirmedOnOpMainnet ||
              !confirmedCanMakeContractCalls ||
              loading ||
              Boolean(
                address &&
                  reward.claim?.address &&
                  address.toLowerCase() === reward.claim.address.toLowerCase(),
              )
            }
            className="self-start"
            variant="destructive"
            onClick={onConfirmAddress}
          >
            Confirm
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function ClaimFormKYC({
  reward,
  disabled,
}: {
  reward: RewardWithProject
  disabled: boolean
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-default rounded-xl p-8"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="justify-between">
          <div className="flex items-center gap-1 flex-1 text-sm font-medium">
            Step 2. Complete KYC
          </div>
          {(reward.claim?.status === "cleared" ||
            reward.claim?.status === "claimed") && <Completed />}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <div className="text-secondary-foreground text-sm">
              First, submit the grant eligibility form. Only one project admin
              needs to submit the form. Please note that it could take up to 2
              business days after form submission to see your status updated
              here.
            </div>

            <ExternalLink href="kyc-link-here">
              <Button
                disabled={disabled}
                variant="destructive"
                className="flex gap-[10px] items-center"
              >
                <div>Get started</div>
                <ArrowUpRight size={16} />
              </Button>
            </ExternalLink>
          </div>
          <div className="text-secondary-foreground text-sm">
            Then, each responsible individual must verify their identity.
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function ClaimFormSuperfluid({
  reward,
  disabled,
}: {
  reward: RewardWithProject
  disabled: boolean
}) {
  const canStartStream = useMemo(() => {
    if (!reward.claim?.tokenStreamClaimableAt) {
      return false
    }

    return isAfter(new Date(), reward.claim.tokenStreamClaimableAt)
  }, [reward])

  const onStartStream = async () => {
    try {
      await completeRewardsClaim(reward.id)
    } catch (error) {
      console.error("Error recording stream start", error)
    }
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-default rounded-xl p-8"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="justify-between">
          <div className="flex items-center gap-1 flex-1 text-sm font-medium">
            Step 3. Receive your grant
          </div>
          {reward.claim?.status === "claimed" && <Completed />}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <div className="text-secondary-foreground text-sm">
              Tokens will be streamed over 100 days on Superfluid.
            </div>

            {/* TODO: Final superfluid link */}
            <ExternalLink href="https://www.superfluid.finance/">
              <Button
                disabled={disabled || !canStartStream}
                variant="destructive"
                className="flex gap-[10px] items-center"
                onClick={onStartStream}
              >
                <div>Claim with Superfluid</div>
                <ArrowUpRight size={16} />
              </Button>
            </ExternalLink>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function Completed() {
  return (
    <div className="flex gap-1 items-center">
      <Check className="stroke-success-foreground" size={16} />
      <div className="text-secondary-foreground text-sm font-normal">
        Completed
      </div>
    </div>
  )
}
