"use client"

import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { getAddress } from "viem"

import { Project } from "@/lib/mocks"
import { cn } from "@/lib/utils"

import { Badge } from "../common/Badge"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"

const TERMS = [
  "I understand that retroPGF grant recipients must complete KYC with the Optimism Foundation.",
  "I understand that any retroPGF funds that are distributed must be claimed within a year of results being announced, or risk forfeiture.",
  "I certify that the potential beneficiary of the grant is not a citizen or resident of, or incorporated in, any jurisdiction designated, blocked, or sanctioned by the United Nations, the European Union, the U.K. Treasury, or the U.S. Treasury's Office of Foreign Assets Control, including but not limited to Cuba, the Democratic Republic of Congo, Iran, North Korea, Russia, Syria, Yemen, or the Crimea, Donetsk, or Luhansk regions of Ukraine.",
  "I certify that the potential beneficiary of the grant is not barred from participating in Optimism's grant program under applicable law.",
  "I understand that access to my Optimist Profile is required to claim Retro Funding rewards.",
]

export const FundingApplication = ({
  className,
  onApply,
}: {
  className?: string
  projects: Project[]
  onApply: () => void
}) => {
  const [recipient, setRecipient] = useState("")
  const [isRecipientValid, setIsRecipientValid] = useState(true)

  const [agreedTerms, setAgreedTerms] = useState(
    Array.from({ length: TERMS.length }, () => false),
  )

  const toggleAgreedTerm = (idx: number) => {
    setAgreedTerms((prev) => {
      const updated = [...prev]
      updated[idx] = !updated[idx]
      return updated
    })
  }

  const validateAddress = (address: string) => {
    try {
      getAddress(address)
      setIsRecipientValid(true)
    } catch (err) {
      setIsRecipientValid(false)
    }
  }

  const canSubmit =
    agreedTerms.every((term) => term) && recipient.length && isRecipientValid

  return (
    <div
      className={cn(
        "flex flex-col gap-y-12 w-full bg-background border rounded-3xl p-16",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-y-6">
        <Image
          alt="sunny"
          src="/assets/images/sunny-eth.png"
          height={80}
          width={80}
        />
        <h2 className="text-2xl font-semibold text-center">
          Retro Funding Round 4: Onchain Builders
        </h2>
        <Badge size="lg" text="Application" />
      </div>

      {/* Information */}
      <div className="flex flex-col gap-y-6 text-muted-foreground">
        <p>
          Retro Funding Round 4 will reward onchain builders who contribute to
          the success of Optimism. This round seeks to expand the reach and
          impact of the network by rewarding those building across the
          Superchain, increasing demand for blockspace, and driving value to the
          Collective.
        </p>
        <p className="">Important information for this round:</p>

        <ul className="list-disc space-y-6 pl-5">
          <li>
            <span className="font-medium">
              Impact assessment via objective data:
            </span>{" "}
            Your project&apos;s code repos and onchain contracts will be
            analyzed against target metrics. Badgeholders will vote on the
            metrics that matter most to them, not on individual projects.
          </li>
          <li>
            <span className="font-medium">Submission deadline:</span> The
            deadline for submissions in May 31 at 23:59 UTC. Please note that
            after you submit your application, you can still make edits to your
            submitted projects until the deadline.
          </li>
        </ul>

        <Link href="#" className="flex items-center gap-x-2 no-underline">
          <p className="font-medium">Learn more about Retro Funding Round 4</p>
          <ArrowUpRight size={20} />
        </Link>
      </div>

      {/* Recipient address */}
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-3">
          <h3 className="text-lg font-semibold">Recipient address</h3>
          <Badge text="Private" />
        </div>

        <p className="text-muted-foreground">
          If this project is awarded Retro Funding, then we&apos;ll send tokens
          to this address. You&apos;ll have a chance to change this before token
          distribution.
        </p>

        <div className="flex flex-col">
          <p className="font-medium">
            Enter an address that can receive funds on OP Mainnet
            <span className="text-destructive">*</span>
          </p>
          <Input
            className="mt-2"
            placeholder="0x..."
            onChange={(e) => setRecipient(e.target.value)}
            onBlur={() => validateAddress(recipient)}
            value={recipient}
          />
          {!isRecipientValid && (
            <p className="mt-1.5 text-sm text-destructive">
              This doesn&apos;t appear to be a valid address, please check it
              again
            </p>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="flex flex-col gap-y-6">
        <h3 className="text-lg font-semibold">Terms</h3>

        <div className="flex flex-col gap-y-4">
          {TERMS.map((term, idx) => (
            <div key={idx} className="flex gap-x-4">
              <Checkbox
                checked={agreedTerms[idx]}
                onCheckedChange={() => toggleAgreedTerm(idx)}
                className="mt-1 border-[1.5px] rounded-none"
              />
              <p className="">{term}</p>
            </div>
          ))}
        </div>

        <p className="">
          See{" "}
          <Link href="#" className="font-medium">
            Optimism&apos;s Privacy Policy
          </Link>{" "}
          for information about RetroPGF signup data is used.
        </p>
      </div>

      <Button
        size="lg"
        onClick={onApply}
        disabled={!canSubmit}
        className="font-medium bg-destructive hover:bg-destructive"
      >
        Submit application
      </Button>
    </div>
  )
}
