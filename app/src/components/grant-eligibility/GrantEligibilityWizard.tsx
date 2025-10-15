"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

import { GrantEligibilityFormProvider, useGrantEligibilityForm } from "@/providers/GrantEligibilityFormProvider"
import { GrantEligibility, Project, Organization, KYCTeam } from "@prisma/client"
import GrantTypeStep from "./steps/GrantTypeStep"
import WalletStep from "./steps/WalletStep"
import SignersStep from "./steps/SignersStep"
import EntitiesStep from "./steps/EntitiesStep"
import SubmitStep from "./steps/SubmitStep"
import StepIndicator from "./StepIndicator"
import GrantEligibilitySuccess from "./GrantEligibilitySuccess"
import { clearGrantEligibilityForm } from "@/lib/actions/grantEligibility"
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog"
import { Button } from "@/components/ui/button"

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
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const router = useRouter()

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const handleClearForm = async () => {
    const result = await clearGrantEligibilityForm(form.id)
    if (result.error) {
      throw new Error(result.error)
    }
    // Reset to step 1 and refresh to get updated data
    setCurrentStep(1)
    router.refresh()
  }

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

  // Force a remount of the provider + steps when the server form changes
  // so local state in steps resets to the latest DB state (e.g., after clear)
  const remountKey = `${form.id}:${new Date((form as any).updatedAt ?? Date.now()).getTime()}`

  return (
    <GrantEligibilityFormProvider
      key={remountKey}
      initialForm={form}
      projectId={projectId}
      organizationId={organizationId}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
    >
      <div className="min-h-screen">
        {/* Header */}
        <div className="max-w-[712px] mx-auto px-6 py-4 mb-8">
          <h1 className="text-4xl font-normal text-center">Grant Eligibility Form</h1>
        </div>

        {/* Step Indicator */}
          <div className="max-w-[712px] mx-auto px-6">
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
        <div className="max-w-[712px] mx-auto px-6 py-8">
          {renderStep()}
          {/* Wizard Controls */}
          <div className="mt-12">
            <WizardControls currentStep={currentStep} />
          </div>
        </div>

        {/* Clear Form Button - Fixed Position */}
        <Button
          type="button"
          onClick={() => setShowClearConfirmation(true)}
          variant="outline"
          className="fixed bottom-6 right-6"
          aria-label="Clear form"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear form
        </Button>

        {/* Clear Form Confirmation Dialog */}
        <ConfirmationDialog
          open={showClearConfirmation}
          onOpenChange={setShowClearConfirmation}
          onConfirm={handleClearForm}
          title="Are you sure you want to clear the form?"
          description="All data will be lost and you'll need to start over."
          confirmText="Yes, clear form"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </GrantEligibilityFormProvider>
  )
}

function WizardControls({ currentStep }: { currentStep: number }) {
  const { goToPreviousStep, goToNextStep, stepControls } = useGrantEligibilityForm()

  const handleNext = async () => {
    if (stepControls.onNext) {
      await stepControls.onNext()
    } else {
      goToNextStep()
    }
  }

  const isLoading = stepControls.isLoading || false
  const buttonLabel = stepControls.nextLabel || "Next"

  return (
    <div className="flex justify-center gap-2 pt-6">
      {currentStep > 1 && (
        <Button
          type="button"
          onClick={goToPreviousStep}
          variant="outline"
        >
          Back
        </Button>
      )}
      <Button
        type="button"
        onClick={handleNext}
        disabled={stepControls.enabled === false || isLoading}
        variant="destructive"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonLabel}
      </Button>
    </div>
  )
}
