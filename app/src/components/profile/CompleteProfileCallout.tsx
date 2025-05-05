import { User } from "@prisma/client"
import { ArrowUpRight, Check, X } from "lucide-react"
import Link from "next/link"

import { VerifiedAddress } from "@/app/profile/verified-addresses/verified-address"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import {
  UserAddressSource,
  UserWithAddresses,
  UserWithEmails,
} from "@/lib/types"
import { profileProgress } from "@/lib/utils"

import { Badge } from "../common/Badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { AddressConnection } from "./AddressConnection"
import { EmailConnection } from "./EmailConnection"
import { GithubConnection } from "./GithubConnection"
import { PrimaryAddress } from "@/app/profile/verified-addresses/primary-address"

export function CompleteProfileCallout({
  user: initialUser,
  setIsCompleteProfileAccordionDismissed,
}: {
  user: UserWithAddresses
  setIsCompleteProfileAccordionDismissed: (dismissed: boolean) => void
}) {
  const { user: loadedUser } = useUser({ id: initialUser.id, enabled: true })
  const user = loadedUser || initialUser

  const progress = profileProgress(user)
  const isComplete = progress === 100

  const onDismiss = () => {
    document.cookie =
      "completeProfileAccordionDismissed=true; max-age=31536000; path=/"
    setIsCompleteProfileAccordionDismissed(true)
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-default rounded-xl hover:shadow-sm"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="p-8 justify-between">
          <div className="flex gap-4 items-center flex-1">
            <div className="text-2xl w-12 h-12 flex items-center justify-center">
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
          <button
            className="flex space-x-2 px-8 py-4 text-xs font-medium text-secondary-foreground"
            onClick={onDismiss}
          >
            <X size={14} />{" "}
            <span>Dismiss — you can always add this info later!</span>
          </button>
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
      <hr className="border border-border w-full" />
      <SetPrimaryAddress user={user} />
    </div>
  )
}

function AddYourEmailStep({ user }: { user: UserWithEmails }) {
  return (
    <div className="flex justify-between pb-4 gap-6">
      <div className="flex gap-4">
        {user.emails.length > 0 ? <GreenCheck /> : <StepNumber num={1} />}
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
          <EmailConnection userId={user.id} />
        </div>
      </div>
    </div>
  )
}

function ConnectYourGithubStep({ user }: { user: User }) {
  return (
    <div className="flex justify-between py-4 gap-6">
      <div className="flex gap-4">
        {user.notDeveloper || user.github ? (
          <GreenCheck />
        ) : (
          <StepNumber num={2} />
        )}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-[2px]">
            <div className="font-medium flex items-center gap-2">
              Connect your GitHub <Badge text="Public" />
            </div>
            <div className="text-secondary-foreground">
              Show your code contributions to the Optimism Collective.
            </div>
          </div>
          <GithubConnection userId={user.id} />
        </div>
      </div>
    </div>
  )
}

function AddVerifiedAddressesStep({ user }: { user: UserWithAddresses }) {
  const { unlinkWallet } = usePrivyLinkWallet(user.id)
  return (
    <div className="flex justify-between py-4 gap-6">
      <div className="flex gap-4">
        {user.addresses.length >= 1 ? <GreenCheck /> : <StepNumber num={3} />}
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
          </div>

          {user.addresses.length === 0 && (
            <AddressConnection userId={user.id}>Add address</AddressConnection>
          )}

          {user.addresses.length >= 1 && (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-foreground font-medium">
                Your verified addresses
              </div>
              <div className="flex flex-col gap-1.5">
                {user.addresses.map(({ address, source, primary }) => (
                  <VerifiedAddress
                    key={address}
                    address={address}
                    primary={primary}
                    showCheckmark={false}
                    source={source as UserAddressSource}
                    onRemove={unlinkWallet}
                    userId={user.id}
                  />
                ))}
              </div>
              <AddressConnection userId={user.id}>
                Add another address
              </AddressConnection>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SetPrimaryAddress({ user }: { user: UserWithAddresses }) {
  return (
    <div className="flex justify-between py-4 gap-6">
      <div className="flex gap-4">
        {user.addresses.some((addr) => addr.primary) ? (
          <GreenCheck />
        ) : (
          <StepNumber num={4} />
        )}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-[2px]">
            <div className="font-medium">Set your primary address</div>
            <div className="text-secondary-foreground">
              Choose one of your verified address to receive attestations from
              Optimism (including the voting badge for Citizens and Guest
              Voters).
              <div className="flex flex-col gap-1.5 mt-4">

                {user.addresses.map(({ address, source, primary }) => (
                  <PrimaryAddress
                    key={address}
                    address={address}
                    primary={primary}
                    showCheckmark={false}
                    source={source as UserAddressSource}
                    userId={user.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
