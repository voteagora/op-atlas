import { User } from "@prisma/client"
import { ArrowUpRight, Check, Mail, Plus, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { VerifiedAddress } from "@/app/profile/verified-addresses/verified-address"
import { syncFarcasterAddresses } from "@/lib/actions/addresses"
import { connectGithub, setUserIsNotDeveloper } from "@/lib/actions/users"
import { isBadgeholderAddress } from "@/lib/badgeholders"
import { UserAddressSource, UserWithAddresses } from "@/lib/types"
import { cn, profileProgress, shortenAddress } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Badge } from "../common/Badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Button } from "../ui/button"

export function CompleteProfileCallout({ user }: { user: UserWithAddresses }) {
  const progress = profileProgress(user)
  const isComplete = progress === 100

  // Attempt to sync Farcaster accounts one time
  useEffect(() => {
    if (user.addresses.length === 0) {
      syncFarcasterAddresses()
    }
  }, [user])

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-default rounded-xl hover:shadow-sm"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="p-8 justify-between">
          <div className="flex items-center gap-1 flex-1">
            <div className="text-3xl font-semibold w-12 h-12 flex items-center justify-center">
              {isComplete ? "👏" : "👋"}
            </div>
            <div className="flex flex-col items-start">
              <div className="text-base font-semibold">
                {isComplete
                  ? "Profile complete!"
                  : "Complete your Optimist Profile"}
              </div>
              {isComplete && (
                <Link
                  href={`/${user.username}`}
                  target="_blank"
                  className="text-sm text-muted-foreground hover:underline flex items-center gap-1 font-medeum"
                >
                  Checkout your public profile
                  <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
          </div>
          <ProgressIndicator progress={progress} />
        </AccordionTrigger>
        <AccordionContent>
          <ProfileSteps user={user} />
          <AccordionTrigger
            className="p-8 py-4 text-xs font-medium text-secondary-foreground"
            hideChevron
          >
            <X size={14} /> Dismiss — you can always add this info later!
          </AccordionTrigger>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function ProgressIndicator({ progress }: { progress: number }) {
  return (
    <div className="h-2 w-20 rounded-[640px] bg-neutral-200 overflow-hidden">
      <div
        className="bg-green-500 h-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function StepNumber({ num }: { num: number }) {
  return (
    <div className="border border-dashed border-muted h-12 w-12 rounded-full flex items-center justify-center">
      {num}
    </div>
  )
}

function GreenCheck() {
  return (
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500">
      <Check size={14} color="white" />
    </div>
  )
}

function ProfileSteps({ user }: { user: UserWithAddresses }) {
  return (
    <div className="flex flex-col px-8">
      <AddYourEmailStep user={user} />
      <hr className="border border-border w-full" />
      <ConnectYourGithubStep user={user} />
      <hr className="border border-border w-full" />
      <AddVerifiedAddressesStep user={user} />
    </div>
  )
}

function AddYourEmailStep({ user }: { user: User }) {
  const { setOpenDialog } = useAppDialogs()
  return (
    <div className="flex justify-between pb-4 gap-6">
      <div className="flex gap-4">
        {user.email ? <GreenCheck /> : <StepNumber num={1} />}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-[2px]">
            <div className="flex gap-2 items-center">
              <div className="font-medium">Add your email</div>
              <Badge
                text="Required"
                textClassName="text-red-600"
                className="bg-red-100"
              />
              <Badge text="Private" />
            </div>
            <div className="text-secondary-foreground">
              Please add email for important messages.
            </div>
          </div>
          {user.email && (
            <div className="flex items-center self-start p-3 border border-border rounded-md gap-1">
              <Mail size={14} />
              <div className="text-secondary-foreground">{user.email}</div>
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={() => setOpenDialog("email")}
        variant={user.email ? "secondary" : "destructive"}
      >
        {user.email ? "Edit" : "Add email"}
      </Button>
    </div>
  )
}

function ConnectYourGithubStep({ user }: { user: User }) {
  const [isDeveloper, setIsDeveloper] = useState(!user.notDeveloper)
  const [loading, setLoading] = useState(false)

  const toggleIsDeveloper = async (isDeveloper: boolean) => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      setIsDeveloper(isDeveloper)
      const result = await setUserIsNotDeveloper(!isDeveloper)
      if (result.error !== null) {
        throw result.error
      }
      toast.success("Developer status updated")
    } catch (error) {
      console.error("Error toggling developer status", error)
      toast.error("Error updating developer status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-between py-4 gap-6">
      <div className="flex gap-4">
        {!isDeveloper || user.github ? <GreenCheck /> : <StepNumber num={2} />}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-[2px]">
            <div className="font-medium flex items-center gap-2">
              Connect your GitHub <Badge text="Public" />
            </div>
            <div className="text-secondary-foreground">
              Show your code contributions to the Optimism Collective.
            </div>
          </div>
          {user.github && (
            <div className="flex items-center self-start p-3 border border-border rounded-md gap-1">
              <Image
                src="/assets/icons/githubIcon.svg"
                height={14}
                width={14}
                alt="Github"
              />
              <div className="text-secondary-foreground">{user.github}</div>
            </div>
          )}
          <div
            className={cn(
              "text-sm font-medium self-start text-foreground p-3 flex gap-1 items-center border border-border rounded-md",
              !isDeveloper && "bg-secondary",
            )}
          >
            <input
              type="checkbox"
              checked={!isDeveloper}
              onChange={(e) => toggleIsDeveloper(!e.target.checked)}
            />
            I&apos;m not a developer
          </div>
        </div>
      </div>
      {!user.github && (
        <Button
          variant="destructive"
          onClick={() => connectGithub()}
          disabled={!isDeveloper}
        >
          Connect Github
        </Button>
      )}
    </div>
  )
}

function AddVerifiedAddressesStep({ user }: { user: UserWithAddresses }) {
  const { setOpenDialog } = useAppDialogs()

  const onCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied")
  }

  return (
    <div className="flex justify-between py-4 gap-6">
      <div className="flex gap-4">
        {user.addresses.length ? <GreenCheck /> : <StepNumber num={3} />}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-[2px]">
              <div className="font-medium">Add verified addresses</div>
              <div className="text-secondary-foreground">
                Display your attestations, ENS, and more.
                <ul className="list-disc pl-4 mt-2 text-sm text-secondary-foreground">
                  <li>
                    If you&apos;re a Citizen or guest voter, please verify your
                    badgeholder address
                  </li>
                  <li>
                    If you&apos;re a Token House delegate, please verify your
                    delegate address
                  </li>
                  <li>
                    If you&apos;ve received foundation attestations, please
                    verify the relevant addresses
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-xs text-secondary-foreground">
              You can also verify addresses directly to your Farcaster account,
              and{" "}
              <Link href="/profile/verified-addresses" className="underline">
                import them to your profile
              </Link>
              . To do so, open Warpcast and choose Settings. Then choose
              Verified addresses and proceed.
            </div>
          </div>

          {user.addresses.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-foreground font-medium">
                Your verified addresses
              </div>
              <div className="flex gap-[6px] flex-wrap">
                {user.addresses.map(({ address, source }) => (
                  <VerifiedAddress
                    key={address}
                    address={shortenAddress(address)}
                    showCheckmark={false}
                    source={source as UserAddressSource}
                    isBadgeholder={isBadgeholderAddress(address)}
                    onCopy={onCopy}
                  />
                ))}
                <button
                  className="h-10 w-10 flex items-center justify-center bg-backgroundSecondary rounded-sm"
                  onClick={() => setOpenDialog("verify_address")}
                >
                  <Plus className="stroke-foreground" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {user.addresses.length < 1 && (
        <Button
          onClick={() => setOpenDialog("verify_address")}
          variant="destructive"
        >
          Verify Address
        </Button>
      )}
    </div>
  )
}
