"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { GrantEligibility, Project, Organization, KYCTeam } from "@prisma/client"

type FullGrantEligibilityForm = GrantEligibility & {
  project?: Project | null
  organization?: Organization | null
  kycTeam?: KYCTeam | null
}

interface StepControls {
  enabled?: boolean
  onNext?: () => void | Promise<void>
  nextLabel?: string
  isLoading?: boolean
}

interface GrantEligibilityFormContextType {
  form: FullGrantEligibilityForm
  setForm: (form: FullGrantEligibilityForm) => void
  projectId?: string
  organizationId?: string
  currentStep: number
  setCurrentStep: (step: number) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  stepControls: StepControls
  setStepControls: (controls: StepControls) => void
}

const GrantEligibilityFormContext = createContext<GrantEligibilityFormContextType | null>(null)

export function useGrantEligibilityForm() {
  const context = useContext(GrantEligibilityFormContext)
  if (!context) {
    throw new Error("useGrantEligibilityForm must be used within GrantEligibilityFormProvider")
  }
  return context
}

interface GrantEligibilityFormProviderProps {
  children: ReactNode
  initialForm: FullGrantEligibilityForm
  projectId?: string
  organizationId?: string
  currentStep: number
  setCurrentStep: (step: number) => void
}

export function GrantEligibilityFormProvider({
  children,
  initialForm,
  projectId,
  organizationId,
  currentStep,
  setCurrentStep,
}: GrantEligibilityFormProviderProps) {
  const [form, setForm] = useState<FullGrantEligibilityForm>(initialForm)
  const [stepControls, setStepControls] = useState<StepControls>({ enabled: true, isLoading: false })

  // Sync form state when initialForm prop changes (e.g., after clearing)
  useEffect(() => {
    setForm(initialForm)
  }, [initialForm])

  const goToNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <GrantEligibilityFormContext.Provider
      value={{
        form,
        setForm,
        projectId,
        organizationId,
        currentStep,
        setCurrentStep,
        goToNextStep,
        goToPreviousStep,
        stepControls,
        setStepControls,
      }}
    >
      {children}
    </GrantEligibilityFormContext.Provider>
  )
}
