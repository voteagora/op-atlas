"use client"

import { useModalStatus } from "@privy-io/react-auth"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  UserCheck,
  Wallet,
  XCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useMemo, useState } from "react"
import { isAddress } from "viem"

import { Badgeholder } from "@/components/common/Badgeholder"
import { Button as CommonButton } from "@/components/common/Button"
import { Farcaster, Github, World, XOptimism } from "@/components/icons/socials"
import { Badge as VerificationBadge } from "@/components/common/Badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyFarcaster } from "@/hooks/privy/usePrivyFarcaster"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { usePrivyLinkTwitter } from "@/hooks/privy/usePrivyLinkTwitter"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { useEnsName } from "@/hooks/useEnsName"
import { useBadgeholderAddress } from "@/lib/hooks"
import {
  checkWalletEligibility,
  s9Qualification,
  S9QualificationResult,
} from "@/lib/actions/citizenship/s9Qualification"
import { createS9Citizen } from "@/lib/actions/citizenship/createS9Citizen"
import { cn } from "@/lib/utils"
import { truncateAddress } from "@/lib/utils/string"
import { useAppDialogs } from "@/providers/DialogProvider"
import { WorldConnection } from "@/components/profile/WorldIdConnection"

import { S9_REGISTRATION_DIALOG_STORAGE_KEY } from "./constants"
import { DialogProps } from "./types"

enum RegistrationStage {
  ConnectSocial = "connect_social",
  LinkWallets = "link_wallets",
  SelectGovernance = "select_governance",
  Checking = "checking",
  ResultReady = "result_ready",
  ResultIssuingAttestation = "result_issuing_attestation",
  ResultFinalSuccess = "result_final_success",
  ResultNeedsVerification = "result_needs_verification",
  ResultNotEligible = "result_not_eligible",
  ResultPriority = "result_priority",
  ResultClosed = "result_closed",
  ResultAlreadyRegistered = "result_already_registered",
  ResultError = "result_error",
}

const STEP_ORDER = [
  RegistrationStage.ConnectSocial,
  RegistrationStage.LinkWallets,
  RegistrationStage.SelectGovernance,
]

export function S9RegistrationDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const { data, setOpenDialog } = useAppDialogs()
  const userId = data.userId
  const seasonId = data.seasonId ?? "9"

  const { user, isLoading, invalidate } = useUser({
    id: userId ?? "",
    enabled: Boolean(userId && open),
  })
  const { linkFarcaster } = usePrivyFarcaster(userId ?? "")
  const { linkGithub } = usePrivyLinkGithub(userId ?? "")
  const { linkTwitter } = usePrivyLinkTwitter(userId ?? "")
  const { linkWallet } = usePrivyLinkWallet(userId ?? "")
  const { isOpen: isPrivyModalOpen } = useModalStatus()
  const router = useRouter()

  const [seasonLabel, setSeasonLabel] = useState(`Season ${seasonId}`)

  const [stage, setStage] = useState<RegistrationStage>(
    RegistrationStage.ConnectSocial,
  )
  const [selectedWallets, setSelectedWallets] = useState<string[]>([])
  const [selectedGovernance, setSelectedGovernance] = useState<string | null>(
    null,
  )
  const [walletEligibility, setWalletEligibility] = useState<
    Record<string, "checking" | "pass" | "fail">
  >({})
  const [result, setResult] = useState<S9QualificationResult | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState({
    kyc: false,
    world: false,
  })

  useEffect(() => {
    if (open) {
      setStage(RegistrationStage.ConnectSocial)
      setSelectedWallets([])
      setSelectedGovernance(null)
      setWalletEligibility({})
      setResult(null)
      setIsRegistering(false)
      setVerificationStatus({ kyc: false, world: false })
      setSeasonLabel(`Season ${seasonId}`)
      invalidate()
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          S9_REGISTRATION_DIALOG_STORAGE_KEY,
          "true",
        )
      }
    }
  }, [open, invalidate, seasonId])

  useEffect(() => {
    if (!user) return
    const wallets = (user.addresses ?? []).map((addr) =>
      addr.address.toLowerCase(),
    )
    setSelectedWallets(wallets)
    const primary = user.addresses?.find((addr) => addr.primary)
    setSelectedGovernance(primary?.address?.toLowerCase() ?? wallets[0] ?? null)
  }, [user])

  // Check wallet eligibility when entering LinkWallets stage or when wallets change
  useEffect(() => {
    if (stage !== RegistrationStage.LinkWallets || !user) return

    const checkWallets = async () => {
      const wallets = user.addresses ?? []

      // Filter out wallets that have already been checked
      const uncheckedWallets = wallets.filter(
        (wallet) => !walletEligibility[wallet.address.toLowerCase()]
      )

      if (uncheckedWallets.length === 0) return

      // Mark all unchecked wallets as "checking" at once
      const checkingState = uncheckedWallets.reduce((acc, wallet) => {
        acc[wallet.address.toLowerCase()] = "checking"
        return acc
      }, {} as Record<string, "checking" | "pass" | "fail">)

      setWalletEligibility((prev) => ({ ...prev, ...checkingState }))

      // Check all wallets in parallel
      const results = await Promise.allSettled(
        uncheckedWallets.map(async (wallet) => {
          const address = wallet.address.toLowerCase()
          try {
            const result = await checkWalletEligibility(address)
            return {
              address,
              status: result.eligible ? "pass" : "fail",
            } as const
          } catch (error) {
            console.error(`Error checking wallet ${address}:`, error)
            return {
              address,
              status: "fail",
            } as const
          }
        })
      )

      // Update state with all results at once
      const finalState = results.reduce((acc, result) => {
        if (result.status === "fulfilled") {
          acc[result.value.address] = result.value.status
        }
        return acc
      }, {} as Record<string, "checking" | "pass" | "fail">)

      setWalletEligibility((prev) => ({ ...prev, ...finalState }))
    }

    checkWallets()
  }, [stage, user, walletEligibility])

  const farcasterConnected = Boolean(user?.farcasterId)
  const githubConnected = Boolean(user?.github)
  const xConnected = Boolean(user?.twitter)

  const canContinueSocial = farcasterConnected || githubConnected || xConnected

  const sortedWallets = useMemo(() => {
    return (user?.addresses ?? [])
      .slice()
      .sort((a, b) => Number(b.primary) - Number(a.primary))
  }, [user?.addresses])

  const canContinueWallets = useMemo(() => {
    // Check if at least one wallet has passed eligibility
    return Object.values(walletEligibility).some((status) => status === "pass")
  }, [walletEligibility])

  const canContinueGovernance = Boolean(selectedGovernance)

  const stepIndex = Math.max(0, STEP_ORDER.indexOf(stage))
  const stepLabel =
    stage === RegistrationStage.Checking
      ? "Checking your eligibility"
      : `${stepIndex + 1} of ${STEP_ORDER.length}`

  const handleClose = (nextOpen: boolean) => {
    // Prevent closing the modal while Privy modal is active
    if (!nextOpen && isPrivyModalOpen) {
      return
    }

    if (!nextOpen) {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(S9_REGISTRATION_DIALOG_STORAGE_KEY)
      }
      setOpenDialog(undefined)
      onOpenChange(false)
    } else {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          S9_REGISTRATION_DIALOG_STORAGE_KEY,
          "true",
        )
      }
      onOpenChange(nextOpen)
    }
  }

  const handleLinkWallet = () => {
    linkWallet()
  }

  const handleRegister = async () => {
    if (!userId || !selectedGovernance) {
      return
    }

    setIsRegistering(true)
    setStage(RegistrationStage.Checking)
    setResult(null)

    try {
      const response = await s9Qualification({
        userId,
        governanceAddress: selectedGovernance,
        seasonId,
      })

      setResult(response)
      setVerificationStatus({
        kyc: response.kycApproved,
        world: response.worldIdVerified,
      })
      setSeasonLabel(response.season.name)

      switch (response.status) {
        case "READY":
          setStage(RegistrationStage.ResultReady)
          break
        case "NEEDS_VERIFICATION":
          setStage(RegistrationStage.ResultNeedsVerification)
          break
        case "PRIORITY_REQUIRED":
          setStage(RegistrationStage.ResultPriority)
          break
        case "REGISTRATION_CLOSED":
          setStage(RegistrationStage.ResultClosed)
          break
        case "ALREADY_REGISTERED":
          setStage(RegistrationStage.ResultAlreadyRegistered)
          break
        case "BLOCKED":
        case "NOT_ELIGIBLE":
          setStage(RegistrationStage.ResultNotEligible)
          break
        default:
          setStage(RegistrationStage.ResultError)
          break
      }
    } catch (error) {
      console.error("Error checking S9 eligibility", error)
      setStage(RegistrationStage.ResultError)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleVerifyIdentity = () => {
    handleClose(false)
    router.push("/profile/details")
  }

  // Handle ResultReady → IssuingAttestation transition
  useEffect(() => {
    if (stage !== RegistrationStage.ResultReady) return

    const timer = setTimeout(async () => {
      setStage(RegistrationStage.ResultIssuingAttestation)

      // Create attestation
      if (!userId || !selectedGovernance) {
        setStage(RegistrationStage.ResultError)
        return
      }

      const attestationResult = await createS9Citizen({
        userId,
        governanceAddress: selectedGovernance,
        seasonId,
        trustBreakdown: result?.trust?.walletScores && result?.trust?.socialScores
          ? {
              walletScores: result.trust.walletScores,
              socialScores: result.trust.socialScores,
              decision: result.trust.decision,
            }
          : undefined,
      })

      if (attestationResult.success) {
        setStage(RegistrationStage.ResultFinalSuccess)
      } else {
        setStage(RegistrationStage.ResultError)
      }
    }, 5000) // 5 seconds

    return () => clearTimeout(timer)
  }, [stage, userId, selectedGovernance, seasonId, result])

  const handleWorldIdConnected = () => {
    setVerificationStatus((prev) => ({ ...prev, world: true }))
  }

  const goToNext = () => {
    if (stage === RegistrationStage.ConnectSocial) {
      setStage(RegistrationStage.LinkWallets)
    } else if (stage === RegistrationStage.LinkWallets) {
      setStage(RegistrationStage.SelectGovernance)
    }
  }

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
          {STEP_ORDER.includes(stage) && (
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

        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!isLoading && user && (
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
                onLinkWallet={handleLinkWallet}
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
                    onClick={() => {
                      handleClose(false)
                      router.push("/governance")
                    }}
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
                    onRegister={handleRegister}
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
                subtitle={`Your onchain activity disqualifies you from becoming a citizen in ${seasonLabel}.`}
                actions={
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleClose(false)}
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
                    onClick={handleLinkWallet}
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
                  onClick={handleRegister}
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
                    onClick={handleLinkWallet}
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

type ConnectSocialStepProps = {
  farcasterConnected: boolean
  githubConnected: boolean
  xConnected: boolean
  onLinkFarcaster: () => void
  onLinkGithub: () => void
  onLinkTwitter: () => void
}

function ConnectSocialStep({
  farcasterConnected,
  githubConnected,
  xConnected,
  onLinkFarcaster,
  onLinkGithub,
  onLinkTwitter,
}: ConnectSocialStepProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-3">
        <SocialRow
          icon={<Farcaster className="w-4 h-4" />}
          name="Farcaster"
          connected={farcasterConnected}
          onConnect={onLinkFarcaster}
        />
        <SocialRow
          icon={<Github className="w-4 h-4" />}
          name="GitHub"
          connected={githubConnected}
          onConnect={onLinkGithub}
        />
        <SocialRow
          icon={<XOptimism className="w-4 h-4" />}
          name="X"
          connected={xConnected}
          onConnect={onLinkTwitter}
        />
      </div>
    </div>
  )
}

type SocialRowProps = {
  icon: ReactNode
  name: string
  connected: boolean
  onConnect?: () => void
  actionLabel?: string
}

function SocialRow({
  icon,
  name,
  connected,
  onConnect,
  actionLabel = "Connect",
}: SocialRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-secondary h-[44px]">
      <div className="flex items-center gap-2 py-3 pl-3">
        <div className="flex items-center justify-center">{icon}</div>
        <span className="text-sm text-foreground">{name}</span>
      </div>
      {connected ? (
        <div className="flex items-center gap-1.5 text-sm text-secondary-foreground pr-3 py-3">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Connected</span>
        </div>
      ) : (
        <div className="pr-1.5 py-1.5">
          <CommonButton variant="secondary" onClick={onConnect} className="h-8">
            {actionLabel}
          </CommonButton>
        </div>
      )}
    </div>
  )
}

type LinkWalletsStepProps = {
  wallets: Array<{ address: string; primary: boolean }>
  walletEligibility: Record<string, "checking" | "pass" | "fail">
  onLinkWallet: () => void
}

function LinkWalletsStep({
  wallets,
  walletEligibility,
  onLinkWallet,
}: LinkWalletsStepProps) {
  return (
    <>
      <h3 className="text-xl font-semibold text-foreground mt-4 text-center">
        Link a wallet with Superchain activity
      </h3>
      <div className="text-center mt-2">
        <Link href="#" className="text-base text-foreground underline">
          View requirements
        </Link>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {wallets.length === 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-border-secondary h-[44px]">
            <div className="flex items-center gap-2 py-3 pl-3">
              <div className="flex items-center justify-center">
                <Wallet className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm text-foreground">Wallets</span>
            </div>
            <div className="pr-1.5 py-1.5">
              <CommonButton
                variant="secondary"
                onClick={onLinkWallet}
                className="h-8"
              >
                Link
              </CommonButton>
            </div>
          </div>
        ) : (
          wallets.map((wallet) => (
            <WalletEligibilityRow
              key={wallet.address}
              address={wallet.address}
              status={
                walletEligibility[wallet.address.toLowerCase()] || "checking"
              }
            />
          ))
        )}
      </div>
    </>
  )
}

type WalletEligibilityRowProps = {
  address: string
  status: "checking" | "pass" | "fail"
}

function WalletEligibilityRow({ address, status }: WalletEligibilityRowProps) {
  const validAddress =
    address && isAddress(address) ? (address as `0x${string}`) : undefined
  const { data: ensName } = useEnsName(validAddress)

  const StatusIcon =
    status === "checking" ? Loader2 : status === "pass" ? CheckCircle2 : XCircle
  const iconClassName = cn(
    "w-4 h-4",
    status === "checking" && "animate-spin",
    status === "pass" && "text-success-strong",
    status === "fail" && "text-destructive",
  )

  const statusLabel =
    status === "checking" ? "Checking" : status === "pass" ? "Pass" : "Fail"

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-secondary px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        {ensName && <span>{ensName}</span>}
        <span className={ensName ? "text-muted-foreground" : ""}>
          {truncateAddress(address)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        <StatusIcon className={iconClassName} />
        <span>{statusLabel}</span>
      </div>
    </div>
  )
}

type SelectGovernanceStepProps = {
  wallets: Array<{ address: string; primary: boolean; source?: string | null }>
  selectedWallets: string[]
  selectedGovernance: string | null
  setSelectedGovernance: (address: string) => void
}

function SelectGovernanceStep({
  wallets,
  selectedWallets,
  selectedGovernance,
  setSelectedGovernance,
}: SelectGovernanceStepProps) {
  const availableWallets = wallets.filter((wallet) =>
    selectedWallets.includes(wallet.address.toLowerCase()),
  )

  return (
    <div className="flex flex-col">
      <h3 className="text-xl font-semibold text-foreground mt-4 text-center">
        If you&apos;re found eligible, where should we issue your citizen badge?
      </h3>
      <RadioGroup
        value={selectedGovernance ?? undefined}
        onValueChange={(value) => setSelectedGovernance(value.toLowerCase())}
        className="mt-6 flex flex-col gap-2"
      >
        {availableWallets.map((wallet) => (
          <WalletSelectionRow
            key={wallet.address}
            address={wallet.address}
            value={wallet.address.toLowerCase()}
            primary={wallet.primary}
            source={wallet.source}
          />
        ))}
      </RadioGroup>
    </div>
  )
}

type WalletSelectionRowProps = {
  address: string
  value: string
  primary: boolean
  source?: string | null
}

function WalletSelectionRow({
  address,
  value,
  primary,
  source,
}: WalletSelectionRowProps) {
  const validAddress =
    address && isAddress(address) ? (address as `0x${string}`) : undefined
  const { data: ensName } = useEnsName(validAddress)
  const { isBadgeholderAddress } = useBadgeholderAddress(address)

  const radioId = `wallet-${value}`

  return (
    <label
      htmlFor={radioId}
      className="flex items-center justify-between gap-3 rounded-lg border border-border-secondary px-3 py-2.5 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem id={radioId} value={value} />
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
            {ensName && <span>{ensName}</span>}
            <span className={ensName ? "text-muted-foreground" : ""}>
              {truncateAddress(address)}
            </span>
            {primary && (
              <VerificationBadge
                text="Governance"
                className="bg-secondary text-secondary-foreground px-2 shrink-0"
              />
            )}
            {isBadgeholderAddress && <Badgeholder />}
            {source === "farcaster" && (
              <VerificationBadge
                text="Farcaster"
                className="bg-secondary text-secondary-foreground px-2"
              />
            )}
            {source === "privy" && (
              <VerificationBadge
                text="Privy"
                className="bg-secondary text-secondary-foreground px-2"
              />
            )}
          </div>
        </div>
      </div>
    </label>
  )
}

function CheckingStep() {
  return (
    <div className="flex flex-col items-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h3 className="mt-4 text-center text-xl font-semibold text-foreground">
        Checking your eligibility
      </h3>
      <p className="mt-2 text-center text-sm text-secondary-foreground">
        This could take a minute
      </p>
    </div>
  )
}

type ResultStepProps = {
  title: string
  subtitle: string
  icon?: "success" | "info" | "warning" | "error" | "check" | "loading"
  customImage?: string
  onClose?: () => void
  actions?: ReactNode
}

function ResultStep({
  title,
  subtitle,
  icon,
  customImage,
  onClose,
  actions,
}: ResultStepProps) {
  const Icon = icon
    ? icon === "loading"
      ? Loader2
      : icon === "check"
      ? Check
      : icon === "success"
      ? CheckCircle2
      : icon === "info"
      ? Info
      : icon === "warning"
      ? AlertCircle
      : XCircle
    : null

  const iconClasses = icon
    ? icon === "loading"
      ? "text-primary animate-spin"
      : icon === "check"
      ? "text-foreground"
      : icon === "success"
      ? "text-success-strong"
      : icon === "info"
      ? "text-primary"
      : icon === "warning"
      ? "text-amber-500"
      : "text-destructive"
    : ""

  return (
    <div className="flex flex-col items-center gap-4">
      {customImage ? (
        <Image
          src={customImage}
          alt={title}
          width={64}
          height={64}
          className="h-16 w-16"
        />
      ) : Icon ? (
        <Icon className={cn("h-16 w-16", iconClasses)} />
      ) : null}
      <div className="flex flex-col gap-2 text-center">
        <div className="text-lg font-semibold text-foreground">{title}</div>
        <div className="text-sm text-secondary-foreground">{subtitle}</div>
      </div>
      {actions ? (
        actions
      ) : onClose ? (
        <Button className="button-primary" onClick={() => onClose()}>
          Close
        </Button>
      ) : null}
    </div>
  )
}

function VerificationActions({
  userId,
  onVerifyIdentity,
  onRegister,
  onCancel,
  isRegistering,
  verificationStatus,
  onWorldIdConnected,
}: {
  userId: string
  onVerifyIdentity: () => void
  onRegister: () => void
  onCancel: () => void
  isRegistering: boolean
  verificationStatus: { kyc: boolean; world: boolean }
  onWorldIdConnected: () => void
}) {
  const canUseWorldId = Boolean(userId)
  const hasVerified = verificationStatus.kyc || verificationStatus.world

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <VerificationOptionRow
          icon={<UserCheck className="h-4 w-4 text-foreground" />}
          label="Verify your identity"
          verified={verificationStatus.kyc}
          action={
            <CommonButton
              variant="secondary"
              onClick={onVerifyIdentity}
              className="h-8"
            >
              Get verified
            </CommonButton>
          }
        />
        <VerificationOptionRow
          icon={<World className="h-4 w-4 text-foreground" />}
          label="Connect your WorldID"
          verified={verificationStatus.world}
          action={
            canUseWorldId ? (
              <WorldConnection
                userId={userId}
                variant="button"
                className="h-8"
                onConnected={onWorldIdConnected}
              >
                Connect
              </WorldConnection>
            ) : (
              <CommonButton className="h-8" disabled variant="secondary">
                Connect
              </CommonButton>
            )
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="destructive"
          className="w-full"
          disabled={!hasVerified || isRegistering}
          onClick={onRegister}
        >
          {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>
        <Button
          variant="outline"
          className="w-full bg-white"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

function VerificationOptionRow({
  icon,
  label,
  action,
  verified = false,
}: {
  icon: ReactNode
  label: string
  action: ReactNode
  verified?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-secondary h-[44px]">
      <div className="flex items-center gap-2 py-3 pl-3">
        <div className="flex items-center justify-center">{icon}</div>
        <span className="text-sm text-foreground">{label}</span>
        {verified && <CheckCircle2 className="h-4 w-4 text-success-strong" />}
      </div>
      <div className="pr-1.5 py-1.5">{action}</div>
    </div>
  )
}
