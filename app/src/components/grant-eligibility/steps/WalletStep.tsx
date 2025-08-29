"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { isAddress } from "viem"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useGrantEligibilityForm } from "@/providers/GrantEligibilityFormProvider"
import { useAppDialogs } from "@/providers/DialogProvider"
import { updateGrantEligibilityForm } from "@/lib/actions/grantEligibility"

type VerificationStatus = "not_verified" | "verifying" | "verified"

export default function WalletStep() {
  const { form, setForm, goToNextStep, setStepControls } = useGrantEligibilityForm()
  const { setOpenDialog, setData } = useAppDialogs()
  const [isPending, startTransition] = useTransition()

  // Initialize state from form data
  const [walletAddress, setWalletAddress] = useState(form.walletAddress || "")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    form.kycTeamId ? "verified" : "not_verified"
  )
  
  // Parse attestations for checkboxes
  const attestations = form.attestations && typeof form.attestations === "object"
    ? (form.attestations as any)
    : {}
  
  const [checkboxes, setCheckboxes] = useState({
    onMainnet: attestations.walletOnMainnet || false,
    canMakeCalls: attestations.walletCanMakeCalls || false,
    pledgeDelegate: attestations.walletPledgeDelegate || false,
  })

  // Validation
  const isAddressValid = walletAddress ? isAddress(walletAddress) : false
  const allCheckboxesChecked = Object.values(checkboxes).every(v => v)
  const canProceed = isAddressValid && allCheckboxesChecked
  const isVerified = verificationStatus === "verified"

  const handleVerify = () => {
    if (!canProceed) {
      toast.error("Please complete all requirements")
      return
    }

    startTransition(async () => {
      try {
        // Save wallet address and attestations to form
        const result = await updateGrantEligibilityForm({
          formId: form.id,
          walletAddress,
          attestations: {
            ...attestations,
            walletOnMainnet: checkboxes.onMainnet,
            walletCanMakeCalls: checkboxes.canMakeCalls,
            walletPledgeDelegate: checkboxes.pledgeDelegate,
          },
        })

        if (result.error) {
          toast.error(result.error)
          return
        }

        if (result.form) {
          setForm(result.form)
          
          // Open verification dialog with success callback
          setData({
            address: walletAddress,
            formId: form.id,
            projectId: form.projectId || undefined,
            organizationId: form.organizationId || undefined,
            onSuccess: (updatedForm) => {
              // Update the form with the new data including kycTeamId
              setForm(updatedForm)
              setVerificationStatus("verified")
            }
          })
          setOpenDialog("verify_grant_delivery_address")
          setVerificationStatus("verifying")
        }
      } catch (error) {
        console.error("Error saving wallet address:", error)
        toast.error("Failed to save progress. Please try again.")
      }
    })
  }

  const handleNext = () => {
    if (!isVerified) {
      toast.error("Please verify your wallet address first")
      return
    }

    startTransition(async () => {
      try {
        const result = await updateGrantEligibilityForm({
          formId: form.id,
          currentStep: Math.max(form.currentStep, 3),  // Never reduce the step
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
    let enabled = false
    let onNext: (() => void) | undefined
    let nextLabel = "Verify"

    if (isVerified) {
      enabled = true
      onNext = handleNext
      nextLabel = "Next"
    } else if (canProceed && !isPending) {
      enabled = true
      onNext = handleVerify
      nextLabel = verificationStatus === "verifying" ? "Verifying" : "Verify"
    }

    setStepControls({ enabled, onNext, nextLabel })

    return () => {
      setStepControls({ enabled: true, onNext: undefined, nextLabel: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, checkboxes, verificationStatus, isPending, canProceed])

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Input the wallet where you would like the grant to be sent.
        </h2>
        <p className="text-base text-secondary-foreground">
          Be sure to triple-check the address! This must be a wallet that is enabled to interact with 
          smart contracts on OP Mainnet.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label htmlFor="wallet-address" className="block text-sm font-medium">
            Grant delivery address<span className="text-destructive">*</span>
          </label>
          <Input
            id="wallet-address"
            type="text"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            disabled={isVerified}
            className={`font-mono ${!isAddressValid && walletAddress ? "border-destructive" : ""}`}
          />
          {walletAddress && !isAddressValid && (
            <p className="text-sm text-destructive">Please enter a valid Ethereum address</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="mainnet"
              checked={checkboxes.onMainnet}
              onCheckedChange={(checked) => 
                setCheckboxes(prev => ({ ...prev, onMainnet: checked === true }))
              }
              disabled={isVerified}
            />
            <label 
              htmlFor="mainnet" 
              className="text-sm font-normal leading-tight cursor-pointer"
            >
              I confirm this address is on OP Mainnet
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="contract-calls"
              checked={checkboxes.canMakeCalls}
              onCheckedChange={(checked) =>
                setCheckboxes(prev => ({ ...prev, canMakeCalls: checked === true }))
              }
              disabled={isVerified}
            />
            <label 
              htmlFor="contract-calls" 
              className="text-sm font-normal leading-tight cursor-pointer"
            >
              I confirm this address can make contract calls
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="delegate"
              checked={checkboxes.pledgeDelegate}
              onCheckedChange={(checked) =>
                setCheckboxes(prev => ({ ...prev, pledgeDelegate: checked === true }))
              }
              disabled={isVerified}
            />
            <label 
              htmlFor="delegate" 
              className="text-sm font-normal leading-tight cursor-pointer"
            >
              I pledge to choose a delegate for this wallet in{" "}
              <a 
                href="https://vote.optimism.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                Optimism Agora
              </a>
            </label>
          </div>
        </div>
      </div>

      {isVerified && (
        <div className="rounded-md bg-green-100 text-green-700 border border-green-200 px-4 py-3 text-sm">
          ✓ Wallet address verified successfully
        </div>
      )}
    </div>
  )
}
