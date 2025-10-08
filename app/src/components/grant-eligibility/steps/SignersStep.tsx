"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useGrantEligibilityForm } from "@/providers/GrantEligibilityFormProvider"
import { updateGrantEligibilityForm } from "@/lib/actions/grantEligibility"

interface Signer {
  firstName: string
  lastName: string
  email: string
}

export default function SignersStep() {
  const { form, setForm, goToNextStep, setStepControls } = useGrantEligibilityForm()
  const [isPending, startTransition] = useTransition()
  
  // Initialize signers from form data or with one empty signer
  const getInitialSigners = (): Signer[] => {
    if (form.data && typeof form.data === "object" && "signers" in form.data) {
      const signers = (form.data as any).signers
      if (Array.isArray(signers) && signers.length > 0) {
        return signers.map((s: any) => ({
          firstName: s.firstName || "",
          lastName: s.lastName || "",
          email: s.email || ""
        }))
      }
    }
    return [{ firstName: "", lastName: "", email: "" }]
  }
  
  const initialSigners = getInitialSigners()
  
  const [signers, setSigners] = useState<Signer[]>(initialSigners)

  const handleSignerChange = (index: number, field: keyof Signer, value: string) => {
    const updatedSigners = [...signers]
    updatedSigners[index] = {
      ...updatedSigners[index],
      [field]: value,
    }
    setSigners(updatedSigners)
  }

  const addSigner = () => {
    setSigners([...signers, { firstName: "", lastName: "", email: "" }])
  }

  const removeSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index))
    }
  }

  const validateSigners = (): boolean => {
    for (const signer of signers) {
      if (!signer.firstName.trim() || !signer.lastName.trim() || !signer.email.trim()) {
        return false
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(signer.email)) {
        return false
      }
    }
    return true
  }

  const isSignerComplete = (signer: Signer): boolean => {
    if (!signer.firstName.trim() || !signer.lastName.trim() || !signer.email.trim()) {
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(signer.email)
  }

  const handleNext = () => {
    if (!validateSigners()) {
      toast.error("Please fill in all required fields with valid information")
      return
    }

    startTransition(async () => {
      try {
        // Preserve existing data and add/update signers
        const existingData = form.data && typeof form.data === "object" ? (form.data as any) : {}
        
        const result = await updateGrantEligibilityForm({
          formId: form.id,
          currentStep: Math.max(form.currentStep, 4),  // Never reduce the step
          data: {
            entities: existingData.entities || [],
            signers: signers,
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
    const enabled = validateSigners() && !isPending

    setStepControls({ 
      enabled, 
      onNext: handleNext, 
      nextLabel: isPending ? "Loading" : "Next",
      isLoading: isPending 
    })

    return () => {
      setStepControls({ enabled: true, onNext: undefined, nextLabel: undefined, isLoading: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signers, isPending])

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h2 className="text-xl font-normal">
          Please identify each responsible individual or signer for this wallet. If you are such person, start with yourself.
        </h2>
        <p className="text-base text-secondary-foreground">
          Be sure to include email addresses where each person can be notified to complete our mandatory identity verification process (KYC).
        </p>
      </div>

      <div className="space-y-20">
        
        {/* Display wallet address */}
        <div>
          <label htmlFor="grant-address" className="block text-sm font-normal mb-2">Grant delivery address</label>
          <Input
            id="grant-address"
            type="text"
            value={form.walletAddress || ""}
            readOnly
            className="text-sm bg-secondary cursor-not-allowed"
          />
        </div>

        {/* Signers list */}
        {signers.map((signer, index) => (
          <div key={index} className="space-y-6 relative group">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-normal">Person {index + 1}</h3>
              {index > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => removeSigner(index)}
                  className="text-secondary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor={`first-name-${index}`} className="block text-sm font-normal mb-2">
                  First name<span className="text-destructive">*</span>
                </label>
                <Input
                  id={`first-name-${index}`}
                  type="text"
                  value={signer.firstName}
                  onChange={(e) => handleSignerChange(index, "firstName", e.target.value)}
                  placeholder="Jane"
                />
              </div>

              <div>
                <label htmlFor={`last-name-${index}`} className="block text-sm font-normal mb-2">
                  Last name<span className="text-destructive">*</span>
                </label>
                <Input
                  id={`last-name-${index}`}
                  type="text"
                  value={signer.lastName}
                  onChange={(e) => handleSignerChange(index, "lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor={`email-${index}`} className="block text-sm font-normal mb-2">
                  Email<span className="text-destructive">*</span>
                </label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={signer.email}
                  onChange={(e) => handleSignerChange(index, "email", e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

            </div>
          </div>
        ))}

        {/* Add another signer button */}
        <Button
          type="button"
          variant="secondary"
          onClick={addSigner}
          className={`flex items-center gap-2 ${isSignerComplete(signers[signers.length - 1]) ? "text-secondary-foreground" : "text-gray-400"}`}
        >
          <Plus className="h-4 w-4" />
          Add another signer
        </Button>
      </div>
    </div>
  )
}
