"use client"

import { Plus } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  getExistingLegalEntitiesForForm,
  updateGrantEligibilityForm,
} from "@/lib/actions/grantEligibility"
import { useGrantEligibilityForm } from "@/providers/GrantEligibilityFormProvider"

interface Entity {
  company: string
  controllerFirstName: string
  controllerLastName: string
  controllerEmail: string
}

export default function EntitiesStep() {
  const { form, setForm, goToNextStep, setStepControls } =
    useGrantEligibilityForm()
  const [isPending, startTransition] = useTransition()
  // Existing verified legal entities tied to this project/org (to be loaded)
  const [existingEntities, setExistingEntities] = useState<VerifiedEntity[]>([])
  const [selectedExistingIds, setSelectedExistingIds] = useState<string[]>([])

  // Load any previously selected existing entity ids from saved form data
  useEffect(() => {
    const savedIds =
      form.data &&
      typeof form.data === "object" &&
      "selectedExistingEntityIds" in form.data
        ? ((form.data as any).selectedExistingEntityIds as string[] | undefined)
        : undefined
    if (Array.isArray(savedIds)) {
      setSelectedExistingIds(savedIds)
    }
  }, [form.data])

  // Fetch existing legal entities for this form's KYCTeam once KYB step is available (step >= 3)
  useEffect(() => {
    let cancelled = false
    async function fetchEntities() {
      try {
        if (!form?.id || (form.currentStep ?? 1) < 3) {
          console.debug("Skipping fetch of existing legal entities", {
            hasFormId: Boolean(form?.id),
            hasKycTeamId: Boolean(form?.kycTeamId),
            currentStep: form?.currentStep ?? 1,
          })
          setExistingEntities([])
          return
        }
        const res = await getExistingLegalEntitiesForForm(form.id)
        console.debug("Existing entities response:", { res })
        if (!cancelled && res) {
          if ((res as any).error) {
            console.error(
              "getExistingLegalEntitiesForForm returned error:",
              (res as any).error,
            )
          }
          if (Array.isArray((res as any).items)) {
            setExistingEntities((res as any).items)
          } else {
            console.warn(
              "Unexpected response shape from getExistingLegalEntitiesForForm; expected items[]:",
              res,
            )
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load existing legal entities", e)
          // Silent fail; do not block the user. Optionally show a toast in future.
        }
      }
    }
    fetchEntities()
    return () => {
      cancelled = true
    }
  }, [form.id, form.kycTeamId, form.currentStep])

  // Initialize entities from form data or with empty array by default.
  // If there are no saved entities, we start with none and let the user add
  // them via the "Add another entity" button.
  const getInitialEntities = (): Entity[] => {
    if (form.data && typeof form.data === "object" && "entities" in form.data) {
      const entities = (form.data as any).entities
      if (Array.isArray(entities) && entities.length > 0) {
        return entities.map((e: any) => ({
          company: e.company || "",
          controllerFirstName: e.controllerFirstName || "",
          controllerLastName: e.controllerLastName || "",
          controllerEmail: e.controllerEmail || "",
        }))
      }
    }
    // If no saved entities: start with no forms by default; user can click Add to reveal.
    return []
  }

  const initialEntities = getInitialEntities()
  const [entities, setEntities] = useState<Entity[]>(initialEntities)
  const [showManualForm, setShowManualForm] = useState<boolean>(false)

  // When selecting a verified entity, only toggle selection; do not prefill forms
  const handleToggleExisting = (
    id: string,
    checked: boolean,
    index: number,
  ) => {
    setSelectedExistingIds((prev) => {
      const exists = prev.includes(id)
      if (checked && !exists) {
        return [...prev, id]
      } else if (!checked && exists) {
        return prev.filter((x) => x !== id)
      }
      return prev
    })
  }

  const handleEntityChange = (
    index: number,
    field: keyof Entity,
    value: string,
  ) => {
    const updatedEntities = [...entities]
    updatedEntities[index] = {
      ...updatedEntities[index],
      [field]: value,
    }
    setEntities(updatedEntities)
  }

  const addEntity = () => {
    // Reveal manual form and ensure at least one entity row exists
    setShowManualForm(true)
    if (entities.length === 0) {
      setEntities([
        {
          company: "",
          controllerFirstName: "",
          controllerLastName: "",
          controllerEmail: "",
        },
      ])
    } else {
      setEntities([
        ...entities,
        {
          company: "",
          controllerFirstName: "",
          controllerLastName: "",
          controllerEmail: "",
        },
      ])
    }
  }

  const removeEntity = (index: number) => {
    if (entities.length > 1) {
      setEntities(entities.filter((_, i) => i !== index))
      return
    }

    // entities.length === 1 - always allow removing the last entity
    setEntities([])
    setShowManualForm(false)
  }

  const isEntityComplete = (entity: Entity): boolean => {
    return !!(
      entity.company.trim() &&
      entity.controllerFirstName.trim() &&
      entity.controllerLastName.trim() &&
      entity.controllerEmail.trim() &&
      // Basic email validation
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.controllerEmail)
    )
  }

  const validateEntities = (): boolean => {
    // Check if we have at least one complete entity
    return entities.some((entity) => isEntityComplete(entity))
  }

  const hasAnyIncompleteData = (): boolean => {
    // Check if any entity has some data but is incomplete
    return entities.some((entity) => {
      const hasAnyData =
        entity.company ||
        entity.controllerFirstName ||
        entity.controllerLastName ||
        entity.controllerEmail
      return hasAnyData && !isEntityComplete(entity)
    })
  }

  const canShowAddButton = (): boolean => {
    if (entities.length === 0) return true
    // Show add button only if the last entity has all mandatory fields filled
    const lastEntity = entities[entities.length - 1]
    return isEntityComplete(lastEntity)
  }

  const handleSubmit = ({ skip = false }: { skip?: boolean } = {}) => {
    if (!skip && hasAnyIncompleteData()) {
      toast.error(
        "Please complete all fields for entities you've started or remove them",
      )
      return
    }

    startTransition(async () => {
      try {
        const existingData =
          form.data && typeof form.data === "object" ? (form.data as any) : {}

        const entitiesToSave = skip
          ? []
          : entities.filter((entity) => isEntityComplete(entity))

        const result = await updateGrantEligibilityForm({
          formId: form.id,
          currentStep: Math.max(form.currentStep, 5),
          data: {
            signers: existingData.signers || [],
            entities: entitiesToSave,
            selectedExistingEntityIds: skip ? [] : selectedExistingIds,
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
    const hasExistingSelection = selectedExistingIds.length > 0
    const hasValidEntities = validateEntities()
    const hasIncomplete = hasAnyIncompleteData()
    const enabled = !hasIncomplete && !isPending
    const canProceed = hasValidEntities || hasExistingSelection
    const nextLabel = canProceed ? "Next" : "Skip"

    setStepControls({
      enabled,
      onNext: () => handleSubmit(),
      nextLabel: isPending ? "Loading" : nextLabel,
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
  }, [entities, selectedExistingIds, isPending])

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-4 mb-20">
        <h2 className="text-xl font-normal">
          Please provide information for any organizations or legal entities
          linked to this grant as a beneficiary or controller.
        </h2>
        <p className="text-base text-secondary-foreground">
          You must declare every for-profit company, non-profit company,
          foundation, UNA, or sole-proprietorship involved if the organization
          is registered with a government authority.
        </p>
        <p className="text-base text-secondary-foreground">
          Please share the full name and email address of a business controller
          we can contact to complete the mandatory verification process (KYB).
        </p>
        <p className="text-base text-secondary-foreground">
          If no organizations or legal entities are involved in your grant, then{" "}
          <button
            type="button"
            onClick={() => handleSubmit({ skip: true })}
            className="ml-1 underline text-primary"
          >
            skip this step
          </button>
          .
        </p>
      </div>

      <div className="space-y-20">
        {existingEntities.length > 0 ? (
          <VerifiedEntities
            items={existingEntities}
            selectedIds={selectedExistingIds}
            onToggle={(id, checked, idx) =>
              handleToggleExisting(id, checked, idx)
            }
          />
        ) : null}

        {/* Entities list - show only when user opts to add OR when there are no verified entities */}
        {entities.length > 0 &&
        (existingEntities.length === 0 || showManualForm) ? (
          <EntitiesFormList
            entities={entities}
            onChange={handleEntityChange}
            onRemove={removeEntity}
          />
        ) : null}

        {/* Add another entity button - always enabled, styled by completeness */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addEntity}
          className={`flex items-center gap-2 ${
            canShowAddButton() ? "text-secondary-foreground" : "text-gray-400"
          }`}
        >
          <Plus className="h-4 w-4" />
          {entities.length === 0 ? "Add entity" : "Add another entity"}
        </Button>
      </div>
    </div>
  )
}

type EntitiesFormListProps = {
  entities: Entity[]
  onChange: (index: number, field: keyof Entity, value: string) => void
  onRemove: (index: number) => void
}

const EntitiesFormList = ({
  entities,
  onChange,
  onRemove,
}: EntitiesFormListProps) => {
  return (
    <div className="space-y-20">
      {entities.map((entity, index) => (
        <div key={index} className="space-y-6 relative group">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-normal">Entity {index + 1}</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-secondary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Remove
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor={`company-${index}`}
                className="block text-sm font-normal mb-2"
              >
                Company
              </label>
              <Input
                id={`company-${index}`}
                type="text"
                value={entity.company}
                onChange={(e) => onChange(index, "company", e.target.value)}
                placeholder="Acme Co."
              />
            </div>

            <div>
              <label
                htmlFor={`controller-first-name-${index}`}
                className="block text-sm font-normal mb-2"
              >
                Controller first name
              </label>
              <Input
                id={`controller-first-name-${index}`}
                type="text"
                value={entity.controllerFirstName}
                onChange={(e) =>
                  onChange(index, "controllerFirstName", e.target.value)
                }
                placeholder="Jane"
              />
            </div>

            <div>
              <label
                htmlFor={`controller-last-name-${index}`}
                className="block text-sm font-normal mb-2"
              >
                Controller last name
              </label>
              <Input
                id={`controller-last-name-${index}`}
                type="text"
                value={entity.controllerLastName}
                onChange={(e) =>
                  onChange(index, "controllerLastName", e.target.value)
                }
                placeholder="Doe"
              />
            </div>

            <div>
              <label
                htmlFor={`controller-email-${index}`}
                className="block text-sm font-normal mb-2"
              >
                Controller email
              </label>
              <Input
                id={`controller-email-${index}`}
                type="email"
                value={entity.controllerEmail}
                onChange={(e) =>
                  onChange(index, "controllerEmail", e.target.value)
                }
                placeholder="name@example.com"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

type VerifiedEntity = {
  id: string
  businessName: string
  controllerFirstName: string
  controllerLastName: string
  controllerEmail: string
  expiresAt?: string | Date | null
}

// Reusable row component that mirrors LegalEntities styling minus status/checkmarks
function VerifiedEntityRow({
  item,
  checked,
  onToggle,
  index,
}: {
  item: VerifiedEntity
  checked: boolean
  index: number
  onToggle: (id: string, checked: boolean, index: number) => void
}) {
  return (
    <div className="flex flex-row w-full pt-[10px] pr-[12px] pb-[10px] pl-[12px] gap-[8px] rounded-[6px] border border-border bg-background">
      <div className="flex flex-row gap-2 items-center w-full">
        <div className="flex flex-row gap-2 items-center ">
          <input
            id={`verified-entity-${item.id}`}
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={checked}
            onChange={(e) => onToggle(item.id, e.target.checked, index)}
          />
          <p className="font-[Inter] font-normal text-[14px] leading-[20px] text-text-foreground">
            {[
              item.businessName,
              `${item.controllerFirstName} ${item.controllerLastName}`.trim(),
              item.controllerEmail,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        {item.expiresAt ? (
          <Badge variant="secondary">
            {`Verified until ${new Date(item.expiresAt).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              },
            )}`}
          </Badge>
        ) : null}
      </div>
    </div>
  )
}

function VerifiedEntities({
  items,
  selectedIds,
  onToggle,
}: {
  items: VerifiedEntity[]
  selectedIds: string[]
  onToggle: (id: string, checked: boolean, index: number) => void
}) {
  return (
    <div className="space-y-8 w-full">
      <h2 className="text-xl font-normal">Verified Entities</h2>
      <p className="text-base text-secondary-foreground">
        If structural changes have been made to any of your verified entities
        (ex: new business controller), please don’t select them. Instead, add a
        new entity below this section.
      </p>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <VerifiedEntityRow
            key={item.id}
            item={item}
            index={idx}
            checked={selectedIds.includes(item.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
