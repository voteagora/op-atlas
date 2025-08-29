"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { GrantEligibilityFormProvider, useGrantEligibilityForm } from "@/providers/GrantEligibilityFormProvider"
import { GrantEligibility, Project, Organization, KYCTeam } from "@prisma/client"
import GrantTypeStep from "./steps/GrantTypeStep"
import WalletStep from "./steps/WalletStep"
import SignersStep from "./steps/SignersStep"
import EntitiesStep from "./steps/EntitiesStep"
import SubmitStep from "./steps/SubmitStep"
import StepIndicator from "./StepIndicator"
import GrantEligibilitySuccess from "./GrantEligibilitySuccess"

type FullGrantEligibilityForm = GrantEligibility & {
  project?: Project | null
  organization?: Organization | null
  kycTeam?: KYCTeam | null
}

interface GrantEligibilityWizardProps {
  form: FullGrantEligibilityForm
  projectId?: string
  organizationId?: string
}

const STEP_TITLES = [
  "Grant",
  "Wallet", 
  "Signers",
  "Entities",
  "Submit"
]

export default function GrantEligibilityWizard({
  form,
  projectId,
  organizationId,
}: GrantEligibilityWizardProps) {
  const [currentStep, setCurrentStep] = useState(form.currentStep || 1)
  const [showSuccess, setShowSuccess] = useState(false)

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <GrantTypeStep />
      case 2:
        return <WalletStep />
      case 3:
        return <SignersStep />
      case 4:
        return <EntitiesStep />
      case 5:
        return <SubmitStep onSuccess={() => setShowSuccess(true)} />
      default:
        return <GrantTypeStep />
    }
  }

  // Show success page if form was submitted successfully
  if (showSuccess) {
    return (
      <GrantEligibilitySuccess 
        projectId={projectId} 
        organizationId={organizationId} 
      />
    )
  }

  return (
    <GrantEligibilityFormProvider
      initialForm={form}
      projectId={projectId}
      organizationId={organizationId}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
    >
      <div className="min-h-screen">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 py-4 mb-8">
          <h1 className="text-4xl font-semibold text-center">Grant Eligibility Form</h1>
        </div>

        {/* Step Indicator */}
          <div className="max-w-4xl mx-auto px-6">
            <StepIndicator
              steps={STEP_TITLES}
              currentStep={currentStep}
              maxReachableStep={form.currentStep}
              onStepClick={(step) => {
                // Allow navigation to any step up to the highest reached (stored in DB)
                if (step <= form.currentStep) {
                  setCurrentStep(step)
                }
              }}
            />
          </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {renderStep()}
          {/* Wizard Controls */}
          <div className="mt-12">
            <WizardControls currentStep={currentStep} />
          </div>
        </div>
      </div>
    </GrantEligibilityFormProvider>
  )
}

function WizardControls({ currentStep }: { currentStep: number }) {
  const { goToPreviousStep, goToNextStep, stepControls } = useGrantEligibilityForm()

  const nextText = stepControls.nextLabel || (currentStep === 5 ? "Submit" : "Next")
  const isLoading = nextText?.includes("Verifying") || nextText?.includes("Loading") || nextText?.includes("Submitting")

  const handleNext = async () => {
    if (stepControls.onNext) {
      await stepControls.onNext()
    } else {
      goToNextStep()
    }
  }

  return (
    <div className="flex justify-center gap-3 pt-6">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={goToPreviousStep}
          className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-border bg-background text-foreground hover:bg-backgroundSecondary"
        >
          Back
        </button>
      )}
      <button
        type="button"
        onClick={handleNext}
        disabled={stepControls.enabled === false}
        className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-destructive text-white disabled:bg-secondary disabled:text-secondary-foreground disabled:cursor-not-allowed"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? nextText?.replace("...", "") : nextText}
      </button>
    </div>
  )
}
