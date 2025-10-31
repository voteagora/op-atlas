"use client"

import { useCallback } from "react"

import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"

import { DialogProps } from "./types"
import {
  useS9RegistrationFlow,
  RegistrationStage,
} from "./s9-registration/useS9RegistrationFlow"
import {
  CheckingStep,
  ConnectSocialStep,
  LinkWalletsStep,
  ResultStep,
  SelectGovernanceStep,
  VerificationActions,
} from "./s9-registration/steps"

export function S9RegistrationDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const {
    user,
    isLoadingUser,
    stage,
    stepLabel,
    showStepCounter,
    seasonLabel,
    farcasterConnected,
    githubConnected,
    xConnected,
    sortedWallets,
    selectedWallets,
    selectedGovernance,
    walletEligibility,
    canContinueSocial,
    canContinueWallets,
    canContinueGovernance,
    isRegistering,
    verificationStatus,
    result,
    isPrivyModalOpen,
    actions: {
      handleClose,
      goToNext,
      setSelectedGovernance,
      handleRegister,
      handleVerifyIdentity,
      handleWorldIdConnected,
      handleStartParticipating,
      linkWallet,
      linkFarcaster,
      linkGithub,
      linkTwitter,
    },
    userId,
  } = useS9RegistrationFlow({ open, onOpenChange })

  const handleRegisterClick = useCallback(async () => {
    if (isRegistering || !canContinueGovernance) {
      return
    }

    const toastId = toast.loading(
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-foreground" />
        <span className="text-sm">Setting governance wallet</span>
      </div>,
      { duration: Infinity, dismissible: true },
    )

    try {
      const success = await handleRegister()
      if (!success) {
        toast.error("Failed to set governance wallet", {
          id: toastId,
          dismissible: true,
          duration: 4000,
        })
        return
      }

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success-strong" />
          <span className="text-sm">Governance wallet set</span>
        </div>,
        { id: toastId, dismissible: true, duration: 4000 },
      )
    } catch (error) {
      toast.error("Failed to set governance wallet", {
        id: toastId,
        dismissible: true,
        duration: 4000,
      })
    }
  }, [canContinueGovernance, handleRegister, isRegistering])

  const handleRegisterFromVerification = useCallback(() => {
    void handleRegisterClick()
  }, [handleRegisterClick])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(event) => {
          if (isPrivyModalOpen) {
            event.preventDefault()
          }
        }}
        onInteractOutside={(event) => {
          if (isPrivyModalOpen) {
            event.preventDefault()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (isPrivyModalOpen) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          {showStepCounter && (
            <div className="flex justify-center">
              <Badge
                variant="secondary"
                className="bg-backgroundSecondary text-sm font-medium"
              >
                {stepLabel}
              </Badge>
            </div>
          )}
        </DialogHeader>

        {isLoadingUser && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!isLoadingUser && user && (
          <div className="flex flex-col gap-6">
            {stage === RegistrationStage.ConnectSocial && (
              <>
                <h3 className="text-xl font-semibold text-foreground mt-4 text-center">
                  Connect at least one social app
                </h3>
                <ConnectSocialStep
                  farcasterConnected={farcasterConnected}
                  githubConnected={githubConnected}
                  xConnected={xConnected}
                  onLinkFarcaster={linkFarcaster}
                  onLinkGithub={linkGithub}
                  onLinkTwitter={linkTwitter}
                />
              </>
            )}

            {stage === RegistrationStage.LinkWallets && (
              <LinkWalletsStep
                wallets={sortedWallets}
                walletEligibility={walletEligibility}
                onLinkWallet={linkWallet}
              />
            )}

            {stage === RegistrationStage.SelectGovernance && (
              <SelectGovernanceStep
                wallets={sortedWallets}
                selectedWallets={selectedWallets}
                selectedGovernance={selectedGovernance}
                setSelectedGovernance={setSelectedGovernance}
              />
            )}

            {stage === RegistrationStage.Checking && <CheckingStep />}

            {stage === RegistrationStage.ResultReady && (
              <ResultStep
                title="You're eligible!"
                subtitle="Hang tight, there's one more step."
                icon="check"
              />
            )}

            {stage === RegistrationStage.ResultIssuingAttestation && (
              <ResultStep
                title="Issuing your citizen badge"
                subtitle="This could take a minute"
                icon="loading"
              />
            )}

            {stage === RegistrationStage.ResultFinalSuccess && (
              <ResultStep
                title="Welcome to Season 9"
                subtitle="You're officially a citizen of Optimism Governance. You'll receive emails about active proposals."
                customImage="/assets/icons/badgeholder-sunny.png"
                actions={
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleStartParticipating}
                  >
                    Start participating
                  </Button>
                }
              />
            )}

            {stage === RegistrationStage.ResultNeedsVerification && (
              <ResultStep
                title="We need more information"
                subtitle={`Please provide at least one additional verification to register as a citizen in ${seasonLabel}.`}
                icon="info"
                actions={
                  <VerificationActions
                    userId={userId ?? ""}
                    onVerifyIdentity={handleVerifyIdentity}
                    onRegister={handleRegisterFromVerification}
                    onCancel={() => handleClose(false)}
                    isRegistering={isRegistering}
                    verificationStatus={verificationStatus}
                    onWorldIdConnected={handleWorldIdConnected}
                  />
                }
              />
            )}

            {stage === RegistrationStage.ResultNotEligible && (
              <ResultStep
                title="Sorry, but you're not eligible"
                subtitle={
                  result?.message ??
                  `Your onchain activity disqualifies you from becoming a citizen in ${seasonLabel}.`
                }
                actions={
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleClose(false, { refresh: true })}
                  >
                    Close
                  </Button>
                }
              />
            )}

            {stage === RegistrationStage.ResultPriority && (
              <ResultStep
                title="Priority access required"
                subtitle={
                  result?.message ??
                  "A qualifying attestation is required to register during the priority window."
                }
                icon="info"
                onClose={() => handleClose(false)}
              />
            )}

            {stage === RegistrationStage.ResultClosed && (
              <ResultStep
                title="Registration unavailable"
                subtitle={
                  result?.message ??
                  "Season registration is currently closed."
                }
                icon="warning"
                onClose={() => handleClose(false)}
              />
            )}

            {stage === RegistrationStage.ResultAlreadyRegistered && (
              <ResultStep
                title="You&apos;re already registered"
                subtitle={
                  result?.message ??
                  `You have already completed registration for ${seasonLabel}.`
                }
                icon="info"
                onClose={() => handleClose(false)}
              />
            )}

            {stage === RegistrationStage.ResultError && (
              <ResultStep
                title="Something went wrong"
                subtitle={
                  result?.message ?? "Please try again in a few minutes."
                }
                icon="error"
                onClose={() => handleClose(false)}
              />
            )}

            {stage === RegistrationStage.ConnectSocial && (
              <Button
                onClick={goToNext}
                disabled={!canContinueSocial}
                className="button-primary w-full"
              >
                Next
              </Button>
            )}

            {stage === RegistrationStage.LinkWallets && (
              <div className="flex flex-col gap-2 mt-6">
                <Button
                  onClick={goToNext}
                  disabled={!canContinueWallets}
                  variant="destructive"
                  className="w-full"
                >
                  Next
                </Button>
                {sortedWallets.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={linkWallet}
                    className="w-full bg-white"
                  >
                    Link another wallet
                  </Button>
                )}
              </div>
            )}

            {stage === RegistrationStage.SelectGovernance && (
              <div className="flex flex-col gap-2 mt-6">
                <Button
                  onClick={handleRegisterClick}
                  disabled={!canContinueGovernance || isRegistering}
                  className="button-primary w-full"
                >
                  {isRegistering && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Register
                </Button>
                {sortedWallets.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={linkWallet}
                    className="w-full bg-white"
                  >
                    Link another wallet
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
