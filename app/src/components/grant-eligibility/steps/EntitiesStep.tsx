"use client"

import { Plus } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateGrantEligibilityForm } from "@/lib/actions/grantEligibility"
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

  // Initialize entities from form data or with empty array (no default entity)
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
    // Start with one empty entity to show the form
    return [
      {
        company: "",
        controllerFirstName: "",
        controllerLastName: "",
        controllerEmail: "",
      },
    ]
  }

  const initialEntities = getInitialEntities()
  const [entities, setEntities] = useState<Entity[]>(initialEntities)

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

  const removeEntity = (index: number) => {
    if (entities.length > 1) {
      setEntities(entities.filter((_, i) => i !== index))
    } else {
      // If removing the last entity, reset it to empty
      setEntities([
        {
          company: "",
          controllerFirstName: "",
          controllerLastName: "",
          controllerEmail: "",
        },
      ])
    }
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

  const handleNext = () => {
    // Allow skipping if no entities or all entities are empty
    if (hasAnyIncompleteData()) {
      toast.error(
        "Please complete all fields for entities you've started or remove them",
      )
      return
    }

    startTransition(async () => {
      try {
        // Preserve existing data and add/update entities
        const existingData =
          form.data && typeof form.data === "object" ? (form.data as any) : {}

        // Filter out completely empty entities before saving
        const entitiesToSave = entities.filter(
          (entity) =>
            entity.company ||
            entity.controllerFirstName ||
            entity.controllerLastName ||
            entity.controllerEmail,
        )

        const result = await updateGrantEligibilityForm({
          formId: form.id,
          currentStep: Math.max(form.currentStep, 5), // Never reduce the step
          data: {
            signers: existingData.signers || [],
            entities: entitiesToSave,
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
    const hasValidEntities = validateEntities()
    const hasIncomplete = hasAnyIncompleteData()
    const enabled = !hasIncomplete && !isPending
    const nextLabel = hasValidEntities ? "Next" : "Skip"

    setStepControls({ 
      enabled, 
      onNext: handleNext, 
      nextLabel: isPending ? "Loading" : nextLabel,
      isLoading: isPending 
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
  }, [entities, isPending])

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-4 mb-20">
        <h2 className="text-xl font-semibold">
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
          If no organizations or legal entities are involved in your grant, then
          skip this step.
        </p>
      </div>

      <div className="space-y-20">
        {/* Entities list */}
        {entities.map((entity, index) => (
          <div key={index} className="space-y-6 relative group">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Entity {index + 1}</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => removeEntity(index)}
                className="text-secondary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor={`company-${index}`}
                  className="block text-sm font-medium mb-2"
                >
                  Company<span className="text-destructive">*</span>
                </label>
                <Input
                  id={`company-${index}`}
                  type="text"
                  value={entity.company}
                  onChange={(e) =>
                    handleEntityChange(index, "company", e.target.value)
                  }
                  placeholder="Acme Co."
                />
              </div>

              <div>
                <label
                  htmlFor={`controller-first-name-${index}`}
                  className="block text-sm font-medium mb-2"
                >
                  Controller first name
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`controller-first-name-${index}`}
                  type="text"
                  value={entity.controllerFirstName}
                  onChange={(e) =>
                    handleEntityChange(
                      index,
                      "controllerFirstName",
                      e.target.value,
                    )
                  }
                  placeholder="Jane"
                />
              </div>

              <div>
                <label
                  htmlFor={`controller-last-name-${index}`}
                  className="block text-sm font-medium mb-2"
                >
                  Controller last name
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  id={`controller-last-name-${index}`}
                  type="text"
                  value={entity.controllerLastName}
                  onChange={(e) =>
                    handleEntityChange(
                      index,
                      "controllerLastName",
                      e.target.value,
                    )
                  }
                  placeholder="Doe"
                />
              </div>

              <div>
                <label
                  htmlFor={`controller-email-${index}`}
                  className="block text-sm font-medium mb-2"
                >
                  Controller email<span className="text-destructive">*</span>
                </label>
                <Input
                  id={`controller-email-${index}`}
                  type="email"
                  value={entity.controllerEmail}
                  onChange={(e) =>
                    handleEntityChange(index, "controllerEmail", e.target.value)
                  }
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add another entity button - always enabled, styled by completeness */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addEntity}
          className={`flex items-center gap-2 ${canShowAddButton() ? "text-secondary-foreground" : "text-gray-400"}`}
        >
          <Plus className="h-4 w-4" />
          Add another entity
        </Button>
      </div>
    </div>
  )
}
