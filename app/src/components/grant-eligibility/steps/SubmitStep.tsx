"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { GrantType } from "@prisma/client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useGrantEligibilityForm } from "@/providers/GrantEligibilityFormProvider"
import { submitGrantEligibilityForm, getSelectedExistingLegalEntitiesForForm } from "@/lib/actions/grantEligibility"

const GRANT_TYPE_LABELS: Record<GrantType, string> = {
  RETRO_FUNDING: "Retro Funding",
  AUDIT_GRANT: "Audit Grant",
  GROWTH_GRANT: "Growth Grant",
  FOUNDATION_MISSION: "Foundation Mission",
}

interface Signer {
  firstName: string
  lastName: string
  email: string
  company?: string
}

interface Entity {
  company: string
  controllerFirstName: string
  controllerLastName: string
  controllerEmail: string
}

type SelectedExistingEntity = {
  id: string
  businessName: string
  controllerFirstName: string
  controllerLastName: string
  controllerEmail: string
  expiresAt?: string | Date | null
}

interface SubmitStepProps {
  onSuccess: () => void
}

export default function SubmitStep({ onSuccess }: SubmitStepProps) {
  const { form, setStepControls } = useGrantEligibilityForm()
  const [isPending, startTransition] = useTransition()

  // Selected existing legal entity details for display on submit
  const [selectedExistingEntities, setSelectedExistingEntities] = useState<
    SelectedExistingEntity[]
  >([])

  // Parse data from form
  const signers: Signer[] =
    form.data && typeof form.data === "object" && "signers" in form.data
      ? (form.data as any).signers || []
      : []

  const entities: Entity[] =
    form.data && typeof form.data === "object" && "entities" in form.data
      ? (form.data as any).entities || []
      : []

  const selectedExistingEntityIds: string[] =
    form.data &&
    typeof form.data === "object" &&
    "selectedExistingEntityIds" in form.data &&
    Array.isArray((form.data as any).selectedExistingEntityIds)
      ? ((form.data as any).selectedExistingEntityIds as string[])
      : []

  // Attestation checkboxes state
  const [attestations, setAttestations] = useState({
    informationComplete: false,
    noSanctionedCountries: false,
    noProhibitedRegions: false,
    noGovernmentSponsorship: false,
    notBarredFromPrograms: false,
    submissionAuthorized: false,
  })

  const allAttestationsChecked = Object.values(attestations).every((v) => v)

  const handleSubmit = () => {
    if (!allAttestationsChecked) {
      toast.error("Please check all attestation boxes to submit")
      return
    }

    startTransition(async () => {
      try {
        const result = await submitGrantEligibilityForm({
          formId: form.id,
          finalAttestations: attestations,
        })

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.success) {
          if (result.warning) {
            toast.warning(result.warning)
          }
          // Call the success callback to show the success page
          onSuccess()
        }
      } catch (error) {
        console.error("Error submitting form:", error)
        toast.error("Failed to submit form. Please try again.")
      }
    })
  }

  useEffect(() => {
    setStepControls({
      enabled: allAttestationsChecked && !isPending,
      onNext: handleSubmit,
      nextLabel: isPending ? "Submitting" : "Submit",
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
  }, [attestations, isPending])

  // Format signer display
  const formatSignerDisplay = (signer: Signer) => {
    const parts = [`${signer.firstName} ${signer.lastName}`, signer.email]
    if (signer.company) {
      parts.push(signer.company)
    }
    return parts.join(", ")
  }

  // Load selected existing entities for display
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        if (!form?.id || selectedExistingEntityIds.length === 0) {
          setSelectedExistingEntities([])
          return
        }
        const res = await getSelectedExistingLegalEntitiesForForm(form.id)
        if (!cancelled) {
          if ((res as any)?.error) {
            console.error("Failed to fetch selected existing legal entities:", (res as any).error)
            setSelectedExistingEntities([])
          } else if (Array.isArray((res as any)?.items)) {
            setSelectedExistingEntities((res as any).items as SelectedExistingEntity[])
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Error loading selected existing legal entities", e)
          setSelectedExistingEntities([])
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id, JSON.stringify(selectedExistingEntityIds)])

  // Format entity display
  const formatEntityDisplay = (entity: Entity) => {
    return `${entity.company}, ${entity.controllerFirstName} ${entity.controllerLastName}, ${entity.controllerEmail}`
  }

  const formatSelectedExistingDisplay = (e: SelectedExistingEntity) => {
    return `${e.businessName}, ${`${e.controllerFirstName} ${e.controllerLastName}`.trim()}, ${e.controllerEmail}`
  }

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h2 className="text-xl font-normal">
          Are you ready to submit this form?
        </h2>
        <p className="text-base text-secondary-foreground">
          Here&#39;s what you&#39;ve told us:
        </p>
      </div>

      {/* Summary Section */}
      <div className="space-y-6">
        {/* Grant Type */}
        <div>
          <label
            htmlFor="grant-type"
            className="block text-sm font-normal mb-2"
          >
            Grant type
          </label>
          <Input
            id="grant-type"
            type="text"
            value={form.grantType ? GRANT_TYPE_LABELS[form.grantType] : ""}
            readOnly
            className="cursor-not-allowed"
          />
        </div>

        {/* Grant Delivery Address */}
        <div>
          <label
            htmlFor="grant-delivery-address"
            className="block text-sm font-normal mb-2"
          >
            Grant delivery address
          </label>
          <Input
            id="grant-delivery-address"
            type="text"
            value={form.walletAddress || ""}
            readOnly
            className="text-sm cursor-not-allowed"
          />
        </div>

        {/* Responsible Individuals and Signers */}
        {signers.length > 0 && (
          <div>
            <p className="block text-sm font-normal mb-2">
              Responsible individuals and signers
            </p>
            <div className="space-y-2">
              {signers.map((signer, index) => (
                <Input
                  key={index}
                  type="text"
                  value={formatSignerDisplay(signer)}
                  readOnly
                  className="cursor-not-allowed"
                />
              ))}
            </div>
          </div>
        )}

        {/* Legal Entities */}
        {(selectedExistingEntities.length > 0 || entities.length > 0) && (
          <div>
            <p className="block text-sm font-normal mb-2">Legal entities</p>
            <div className="space-y-2">
              {selectedExistingEntities.map((e) => (
                <Input
                  key={`selected-${e.id}`}
                  type="text"
                  value={formatSelectedExistingDisplay(e)}
                  readOnly
                  className="cursor-not-allowed"
                />
              ))}
              {entities.map((entity, index) => (
                <Input
                  key={`manual-${index}`}
                  type="text"
                  value={formatEntityDisplay(entity)}
                  readOnly
                  className="cursor-not-allowed"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attestations Section */}
      <div className="space-y-4 pt-6 text-secondary-foreground">
        <p className="text-base mb-8">
          By submitting this form and selecting the below, you represent and
          warrant on behalf of yourself and your team or organization...
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="info-complete"
              checked={attestations.informationComplete}
              onCheckedChange={(checked) =>
                setAttestations((prev) => ({
                  ...prev,
                  informationComplete: checked === true,
                }))
              }
              disabled={isPending}
            />
            <label
              htmlFor="info-complete"
              className="text-base font-normal leading-tight cursor-pointer"
            >
              That the information you provided in this form is complete and
              accurate.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="no-sanctioned"
              checked={attestations.noSanctionedCountries}
              onCheckedChange={(checked) =>
                setAttestations((prev) => ({
                  ...prev,
                  noSanctionedCountries: checked === true,
                }))
              }
              disabled={isPending}
            />
            <label
              htmlFor="no-sanctioned"
              className="text-base font-normal leading-tight cursor-pointer"
            >
              That no person or legal entity associated with your grant
              application is a resident of, or located within, any jurisdiction
              sanctioned by the United Nations, European Union, any EU nation,
              His Majesty&#39;s (U.K.) Treasury, or the U.S. Secretary of State.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="no-prohibited"
              checked={attestations.noProhibitedRegions}
              onCheckedChange={(checked) =>
                setAttestations((prev) => ({
                  ...prev,
                  noProhibitedRegions: checked === true,
                }))
              }
              disabled={isPending}
            />
            <label
              htmlFor="no-prohibited"
              className="text-base font-normal leading-tight cursor-pointer"
            >
              That no person or legal entity associated with your grant
              application is a resident of, or located within Belarus, Cuba,
              Republic of Congo, Iran, North Korea, Russian Federation, Syria,
              the Crimea, Donetsk, and Luhansk regions of Ukraine, or Yemen.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="no-sponsorship"
              checked={attestations.noGovernmentSponsorship}
              onCheckedChange={(checked) =>
                setAttestations((prev) => ({
                  ...prev,
                  noGovernmentSponsorship: checked === true,
                }))
              }
              disabled={isPending}
            />
            <label
              htmlFor="no-sponsorship"
              className="text-base font-normal leading-tight cursor-pointer"
            >
              That no person or legal entity associated with your grant has
              received any sponsorship, assistance, or financial contributions
              from any government entity or political figure.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="not-barred"
              checked={attestations.notBarredFromPrograms}
              onCheckedChange={(checked) =>
                setAttestations((prev) => ({
                  ...prev,
                  notBarredFromPrograms: checked === true,
                }))
              }
              disabled={isPending}
            />
            <label
              htmlFor="not-barred"
              className="text-base font-normal leading-tight cursor-pointer"
            >
              That no person or legal entity is barred from participating in the
              Optimism Foundation&#39;s grant programs under any Terms &
              Conditions (to which you agreed during the grant application
              process), or under applicable law.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="authorized"
              checked={attestations.submissionAuthorized}
              onCheckedChange={(checked) =>
                setAttestations((prev) => ({
                  ...prev,
                  submissionAuthorized: checked === true,
                }))
              }
              disabled={isPending}
            />
            <label
              htmlFor="authorized"
              className="text-base font-normal leading-tight cursor-pointer"
            >
              Your submission of this form, and your assent to these and all
              other representations and warranties contained in this form, was
              duly authorized by all responsible persons, including every
              individual, group, and organization identified in this form.
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
