import { format, isAfter } from "date-fns"
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

import { Callout } from "../common/Callout"
import ExternalLink, { MaybeLink } from "../ExternalLink"
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
        disabled={
          !Boolean(reward.claim?.address) || reward.claim?.status !== "pending"
        }
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
  const formLink = useMemo<string | null>(() => {
    if (disabled) {
      return null
    }
    if (!reward.id || !reward.projectId || !reward.claim?.address) {
      return null
    }

    return `https://superchain.typeform.com/to/KoPTjofd#grant_id=${reward.id}&project_id=${reward.projectId}&l2_address=${reward.claim.address}`
  }, [reward, disabled])

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
              <span className="text-foreground font-medium">
                First, submit the grant eligibility form.
              </span>{" "}
              Only one project admin needs to submit the form.
            </div>

            <MaybeLink url={formLink} className="self-start">
              <Button
                disabled={disabled || !formLink}
                variant="destructive"
                className="flex gap-[10px] items-center"
              >
                <div>Fill out the form</div>
                <ArrowUpRight size={16} />
              </Button>
            </MaybeLink>
          </div>
          <div className="flex flex-col gap-6">
            <div className="text-secondary-foreground text-sm">
              <span className="text-foreground font-medium">
                Next, verify your identity.
              </span>{" "}
              Each person or business identified in the form must verify their
              identity. Individuals should verify at kyc.optimism.io while
              businesses should verify at kyb.optimism.io.
              <br />
              <br />
              Once all team members have completed their own KYC,{" "}
              <span className="text-foreground font-medium">
                you will be notified of the outcome within 48 hours.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MaybeLink url={disabled ? null : "https://kyb.optimism.io"}>
                <Button
                  disabled={disabled}
                  variant="secondary"
                  className="flex gap-[10px] items-center"
                >
                  <div>Verify my business</div>
                  <ArrowUpRight size={16} />
                </Button>
              </MaybeLink>

              <MaybeLink url={disabled ? null : "https://kyc.optimism.io"}>
                <Button
                  disabled={disabled}
                  variant="secondary"
                  className="flex gap-[10px] items-center"
                >
                  <div>Verify my ID</div>
                  <ArrowUpRight size={16} />
                </Button>
              </MaybeLink>
            </div>
          </div>

          <p className="text-secondary-foreground text-xs">
            Need help? Contact{" "}
            <ExternalLink
              href="mailto:retrofunding.optimism.io"
              className="text-foreground font-medium"
            >
              retrofunding@optimism.io
            </ExternalLink>
          </p>
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

            {reward.claim?.tokenStreamClaimableAt && !canStartStream ? (
              <Callout
                type="info"
                showIcon={false}
                text={`You can start your token stream on or after ${format(
                  reward.claim.tokenStreamClaimableAt,
                  "eeee, MMMM d",
                )}`}
              />
            ) : (
              <MaybeLink
                className="self-start"
                url={
                  reward.claim?.address
                    ? `https://app.superfluid.finance/vesting?view=${reward.claim.address}`
                    : null
                }
              >
                <Button
                  variant="destructive"
                  className="flex gap-[10px] items-center"
                  onClick={onStartStream}
                  disabled={
                    disabled || !reward.claim?.address || !canStartStream
                  }
                >
                  <div>Claim with Superfluid</div>
                  <ArrowUpRight size={16} />
                </Button>
              </MaybeLink>
            )}
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
