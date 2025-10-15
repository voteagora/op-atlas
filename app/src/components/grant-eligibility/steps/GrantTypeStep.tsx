"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGrantEligibilityForm } from "@/providers/GrantEligibilityFormProvider"
import { updateGrantEligibilityForm } from "@/lib/actions/grantEligibility"
import { GrantType } from "@prisma/client"
import ExternalLink from "@/components/ExternalLink"

const GRANT_OPTIONS = [
  { value: "RETRO_FUNDING", label: "Retro Funding" },
  { value: "AUDIT_GRANT", label: "Audit Grant" },
  { value: "GROWTH_GRANT", label: "Growth Grant" },
  { value: "FOUNDATION_MISSION", label: "Foundation Mission" },
]

export default function GrantTypeStep() {
  const { form, setForm, goToNextStep, setStepControls } =
    useGrantEligibilityForm()
  const [isPending, startTransition] = useTransition()
  const initialAttestations: {
    understand?: boolean
    privacyConsent?: boolean
  } =
    form.attestations &&
    typeof form.attestations === "object" &&
    !Array.isArray(form.attestations)
      ? (form.attestations as {
          understand?: boolean
          privacyConsent?: boolean
        })
      : {}
  const [acknowledgeChoice, setAcknowledgeChoice] = useState<
    "understand" | "more-info" | ""
  >(initialAttestations.understand ? "understand" : "")
  const [privacyChoice, setPrivacyChoice] = useState<
    "consent" | "no-consent" | ""
  >(initialAttestations.privacyConsent ? "consent" : "")
  const [selectedGrant, setSelectedGrant] = useState<GrantType | undefined>(
    form.grantType || undefined,
  )

  const handleNext = () => {
    if (acknowledgeChoice !== "understand") {
      toast.error("Please confirm you understand the form requirements")
      return
    }

    if (privacyChoice !== "consent") {
      toast.error("Please consent to the privacy policy")
      return
    }

    if (!selectedGrant) {
      toast.error("Please select a grant type")
      return
    }

    startTransition(async () => {
      try {
        const result = await updateGrantEligibilityForm({
          formId: form.id,
          currentStep: Math.max(form.currentStep, 2), // Never reduce the step
          grantType: selectedGrant,
          attestations: {
            ...((form.attestations as object) || {}), // Preserve existing attestations
            understand: acknowledgeChoice === "understand",
            privacyConsent: privacyChoice === "consent",
          },
        })

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.form) {
          setForm(result.form)
          goToNextStep()
        }
      } catch (error) {
        console.error("Error updating form:", error)
        toast.error("Failed to save progress. Please try again.")
      }
    })
  }

  useEffect(() => {
    const enabled =
      acknowledgeChoice === "understand" &&
      privacyChoice === "consent" &&
      Boolean(selectedGrant) &&
      !isPending

    setStepControls({
      enabled,
      onNext: handleNext,
      nextLabel: isPending ? "Loading" : "Next",
      isLoading: isPending,
    })

    return () => {
      setStepControls({
        enabled: true,
        onNext: undefined,
        nextLabel: undefined,
        isLoading: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acknowledgeChoice, privacyChoice, selectedGrant, isPending])

  return (
    <div className="space-y-8 w-full">
      {/* Introduction */}
      <div className="space-y-4">
        <p className="font-normal text-xl">
          In this form, you&#39;ll submit a wallet address for receiving grants
          from Optimism. You&#39;ll also report any legal entities and
          associated parties who will act as beneficiaries or controllers of the
          grants you may receive.
        </p>
        <p className="text-base text-secondary-foreground">
          Failure to fill out this form accurately may result in the revocation
          or delay of your grant.
        </p>
      </div>

      {/* Understanding Confirmation */}
      <div className="space-y-3">
        <RadioGroup
          value={acknowledgeChoice}
          onValueChange={(value) => setAcknowledgeChoice(value as any)}
        >
          <label htmlFor="understand" className="block cursor-pointer">
            <div
              className={
                `flex items-center gap-3 rounded-md border border-border px-4 py-3 ` +
                (acknowledgeChoice === "understand"
                  ? "ring-1 ring-foreground"
                  : "")
              }
            >
              <RadioGroupItem value="understand" id="understand" />
              <span className="text-sm font-normal">I understand</span>
            </div>
          </label>
          <label htmlFor="more-info" className="block cursor-pointer">
            <div
              className={
                `flex items-center gap-3 rounded-md border border-border px-4 py-3 ` +
                (acknowledgeChoice === "more-info"
                  ? "ring-1 ring-foreground"
                  : "")
              }
            >
              <RadioGroupItem value="more-info" id="more-info" />
              <span className="text-sm font-normal">
                I want more information
              </span>
            </div>
          </label>
        </RadioGroup>
        {acknowledgeChoice === "more-info" && (
          <div className="rounded-md bg-red-100 text-red-700 border border-red-200 px-4 py-3 text-sm">
            For more information, or if you require translation services, please
            email us at
            <a className="ml-1 underline" href="mailto:compliance@optimism.io">
              compliance@optimism.io
            </a>
            .
          </div>
        )}
      </div>

      {/* Privacy Policy */}
      <div className="space-y-4 pt-6">
        <h3 className="text-xl font-normal">
          We respect your privacy. Period.
        </h3>
        <p className="text-base text-secondary-foreground">
          Your identity will never be shared publicly or published in
          association with your grant announcement unless you explicitly consent
          in writing.
        </p>
        <p className="text-base text-secondary-foreground">
          Your own information and the information of each person you identify
          during this process is subject to the Optimism Foundation&#39;s Data
          Privacy Notice, which you can read{" "}
          <ExternalLink
            href="https://www.optimism.io/data-privacy-policy"
            className="underline"
          >
            here
          </ExternalLink>
          .
        </p>

        <RadioGroup
          value={privacyChoice}
          onValueChange={(value) => setPrivacyChoice(value as any)}
        >
          <label htmlFor="consent" className="block cursor-pointer">
            <div
              className={
                `flex items-center gap-3 rounded-md border border-border px-4 py-3 ` +
                (privacyChoice === "consent" ? "ring-1 ring-foreground" : "")
              }
            >
              <RadioGroupItem value="consent" id="consent" />
              <span className="text-sm font-normal">
                I understand and consent to this policy
              </span>
            </div>
          </label>
          <label htmlFor="no-consent" className="block cursor-pointer">
            <div
              className={
                `flex items-center gap-3 rounded-md border border-border px-4 py-3 ` +
                (privacyChoice === "no-consent" ? "ring-1 ring-foreground" : "")
              }
            >
              <RadioGroupItem value="no-consent" id="no-consent" />
              <span className="text-sm font-normal">
                I do not understand and/or I do not consent
              </span>
            </div>
          </label>
        </RadioGroup>
        {privacyChoice === "no-consent" && (
          <div className="rounded-md bg-red-100 text-red-700 border border-red-200 px-4 py-3 text-sm">
            For more information, or if you require translation services, please
            email us at
            <a className="ml-1 underline" href="mailto:compliance@optimism.io">
              compliance@optimism.io
            </a>
            .
          </div>
        )}
      </div>

      {/* Grant Type Selection */}
      <div className="space-y-4 pt-6">
        <h3 className="text-xl font-normal">
          Which type of Optimism Grant were you awarded?
        </h3>
        <p className="text-base text-secondary-foreground">
          If you&#39;re not sure, please check the original award email or ask
          your point of contact at the Foundation.
        </p>

        <Select
          value={selectedGrant}
          onValueChange={(value) => setSelectedGrant(value as GrantType)}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            {GRANT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-sm"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
