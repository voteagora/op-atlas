import { User } from "@prisma/client"
import { Check, Mail, X } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { useAppDialogs } from "@/providers/DialogProvider"

import { Badge } from "../common/Badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Button } from "../ui/button"

export function CompleteProfileCallout({ user }: { user: User }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-default rounded-2xl"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="p-8 justify-between">
          <div className="flex items-center gap-1 flex-1">
            <div className="text-xl">👋</div>
            <div className="p-3 font-semibold">
              Complete your Optimist Profile
            </div>
          </div>
          <ProgressIndicator stepsCompleted={1} />
        </AccordionTrigger>
        <AccordionContent>
          <ProfileSteps user={user} />
          <AccordionTrigger
            className="p-8 text-xs font-medium text-secondary-foreground"
            hideChevron
          >
            <X size={14} /> Dismiss — you can always add this info later!
          </AccordionTrigger>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function ProgressIndicator({ stepsCompleted }: { stepsCompleted: number }) {
  return (
    <div className="h-2 w-20 rounded-[640px] bg-neutral-200 overflow-hidden">
      <div
        className="bg-green-500 h-full transition-all duration-300"
        style={{ width: `${(stepsCompleted / 3) * 100}%` }}
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

function ProfileSteps({ user }: { user: User }) {
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
    <div className="flex justify-between pb-6 gap-6">
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
            </div>
            <div className="text-secondary-foreground">
              Please add email for important messages. Don&apos;t worry,
              we&apos;ll keep it private.
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

// TODO: update when there is a user.github field
function ConnectYourGithubStep({ user }: { user: User }) {
  const [isDeveloper, setIsDeveloper] = useState(true) // TODO: read from user object

  return (
    <div className="flex justify-between py-6 gap-6">
      <div className="flex gap-4">
        {/* TODO: add user.github check here too */}
        {!isDeveloper ? <GreenCheck /> : <StepNumber num={2} />}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-[2px]">
            <div className="font-medium">Connect your GitHub</div>
            <div className="text-secondary-foreground">
              Show your code contributions to the Optimism Collective. This step
              is required for developers wanting to vote in Round 5.
            </div>
          </div>
          {/* {user.github && (
            <div className="flex items-center self-start p-3 border border-border rounded-md gap-1">
              <Mail size={14} />
              <div className="text-secondary-foreground">{user.github}</div>
            </div>
          )} */}
          <div
            className={cn(
              "text-sm font-medium self-start text-foreground p-3 flex gap-1 items-center border border-border rounded-md",
              !isDeveloper && "bg-secondary",
            )}
          >
            <input
              type="checkbox"
              checked={!isDeveloper}
              onChange={(e) => setIsDeveloper(!e.target.checked)}
            />
            I&apos;m not a developer
          </div>
        </div>
      </div>
      <Button variant="destructive" disabled={!isDeveloper}>
        Connect Github
      </Button>
    </div>
  )
}

function AddVerifiedAddressesStep({ user }: { user: User }) {
  return (
    <div className="flex justify-between py-6 gap-6">
      <div className="flex gap-4">
        <StepNumber num={3} />
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-[2px]">
            <div className="font-medium">Add verified addresses</div>
            <div className="text-secondary-foreground">
              Add a proof of ownership of an Ethereum account to your public
              profile, so ENS and attestations can be displayed. Required for
              Badgeholders.
            </div>
          </div>
        </div>
      </div>
      <Button variant="destructive">Connect wallet</Button>
    </div>
  )
}
