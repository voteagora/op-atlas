"use client"

import { useModalStatus } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { makeUserAddressPrimaryAction } from "@/app/profile/verified-addresses/actions"
import { useUser, USER_ADDRESSES_QUERY_KEY, USER_QUERY_KEY } from "@/hooks/db/useUser"
import { usePrivyFarcaster } from "@/hooks/privy/usePrivyFarcaster"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { usePrivyLinkTwitter } from "@/hooks/privy/usePrivyLinkTwitter"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import {
  checkWalletEligibility,
  s9Qualification,
  S9QualificationResult,
} from "@/lib/actions/citizenship/s9Qualification"
import { createS9Citizen } from "@/lib/actions/citizenship/createS9Citizen"
import { useAppDialogs } from "@/providers/DialogProvider"
import { getAddress } from "viem"

import { S9_REGISTRATION_DIALOG_STORAGE_KEY } from "../constants"

export enum RegistrationStage {
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

export const STEP_ORDER: RegistrationStage[] = [
  RegistrationStage.ConnectSocial,
  RegistrationStage.LinkWallets,
  RegistrationStage.SelectGovernance,
]

type WalletEligibilityState = Record<string, "checking" | "pass" | "fail">

export type UseS9RegistrationFlowArgs = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export type UseS9RegistrationFlowResult = {
  userId?: string
  user: ReturnType<typeof useUser>["user"]
  isLoadingUser: boolean
  stage: RegistrationStage
  stepLabel: string
  showStepCounter: boolean
  seasonLabel: string
  farcasterConnected: boolean
  githubConnected: boolean
  xConnected: boolean
  sortedWallets: Array<{ address: string; primary: boolean; source?: string | null }>
  selectedWallets: string[]
  selectedGovernance: string | null
  walletEligibility: WalletEligibilityState
  canContinueSocial: boolean
  canContinueWallets: boolean
  canContinueGovernance: boolean
  isRegistering: boolean
  verificationStatus: { kyc: boolean; world: boolean }
  result: S9QualificationResult | null
  isPrivyModalOpen: boolean
  actions: {
    handleClose: (nextOpen: boolean, options?: { refresh?: boolean }) => void
    goToNext: () => void
    setSelectedGovernance: (address: string | null) => void
    handleRegister: () => Promise<boolean>
    handleVerifyIdentity: () => void
    handleWorldIdConnected: () => void
    handleStartParticipating: () => void
    linkWallet: () => void
    linkFarcaster: () => void
    linkGithub: () => void
    linkTwitter: () => void
  }
}

export function useS9RegistrationFlow({
  open,
  onOpenChange,
}: UseS9RegistrationFlowArgs): UseS9RegistrationFlowResult {
  const { data, setOpenDialog } = useAppDialogs()
  const userId = data.userId
  const seasonId = data.seasonId ?? "9"

  const queryClient = useQueryClient()
  const router = useRouter()

  const { user, isLoading, invalidate } = useUser({
    id: userId ?? "",
    enabled: Boolean(userId && open),
  })

  const { linkFarcaster } = usePrivyFarcaster(userId ?? "")
  const { linkGithub } = usePrivyLinkGithub(userId ?? "")
  const { linkTwitter } = usePrivyLinkTwitter(userId ?? "")
  const { linkWallet } = usePrivyLinkWallet(userId ?? "")
  const { isOpen: isPrivyModalOpen } = useModalStatus()

  const [seasonLabel, setSeasonLabel] = useState(`Season ${seasonId}`)
  const [stage, setStage] = useState<RegistrationStage>(RegistrationStage.ConnectSocial)
  const [selectedWallets, setSelectedWallets] = useState<string[]>([])
  const [selectedGovernance, setSelectedGovernance] = useState<string | null>(null)
  const [walletEligibility, setWalletEligibility] = useState<WalletEligibilityState>({})
  const [result, setResult] = useState<S9QualificationResult | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState({ kyc: false, world: false })

  const walletEligibilityRef = useRef<WalletEligibilityState>({})

  useEffect(() => {
    walletEligibilityRef.current = walletEligibility
  }, [walletEligibility])

  const attestationTimeoutRef = useRef<number | null>(null)

  const invalidateUserQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, userId] }),
      queryClient.invalidateQueries({ queryKey: [USER_ADDRESSES_QUERY_KEY, userId] }),
    ]).then(() => undefined)
  }, [queryClient, userId])

  // Reset dialog state when newly opened
  useEffect(() => {
    if (!open) {
      return
    }

    setStage(RegistrationStage.ConnectSocial)
    setSelectedWallets([])
    setSelectedGovernance(null)
    setWalletEligibility({})
    setResult(null)
    setIsRegistering(false)
    setVerificationStatus({ kyc: false, world: false })
    setSeasonLabel(`Season ${seasonId}`)

    invalidate()
    void invalidateUserQueries()

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(S9_REGISTRATION_DIALOG_STORAGE_KEY, "true")
    }
  }, [open, invalidate, seasonId, invalidateUserQueries])

  // Keep wallet selections aligned with current user data
  useEffect(() => {
    if (!user) return

    const wallets = (user.addresses ?? []).map((addr) => addr.address.toLowerCase())
    setSelectedWallets(wallets)

    const primary = user.addresses?.find((addr) => addr.primary)?.address?.toLowerCase()
    setSelectedGovernance(primary ?? wallets[0] ?? null)
  }, [user])

  // Trigger wallet eligibility checks when entering the relevant stage
  useEffect(() => {
    if (stage !== RegistrationStage.LinkWallets || !user) {
      return
    }

    const wallets = user.addresses ?? []
    const currentEligibility = walletEligibilityRef.current
    const pendingWallets = wallets.filter((wallet) => {
      const status = currentEligibility[wallet.address.toLowerCase()]
      return status !== "pass" && status !== "fail"
    })

    if (pendingWallets.length === 0) {
      return
    }

    const checkingState = pendingWallets.reduce<WalletEligibilityState>((acc, wallet) => {
      acc[wallet.address.toLowerCase()] = "checking"
      return acc
    }, {})

    setWalletEligibility((prev) => ({ ...prev, ...checkingState }))

    let isActive = true

    const runEligibility = async () => {
      const results = await Promise.allSettled(
        pendingWallets.map(async (wallet) => {
          const address = wallet.address.toLowerCase()
          try {
            const response = await checkWalletEligibility(address)
            return { address, status: response.eligible ? "pass" : "fail" } as const
          } catch (error) {
            console.error(`Error checking wallet ${address}:`, error)
            return { address, status: "fail" as const }
          }
        }),
      )

      if (!isActive) return

      const finalState = results.reduce<WalletEligibilityState>((acc, outcome, index) => {
        if (outcome.status === "fulfilled") {
          acc[outcome.value.address] = outcome.value.status
        } else {
          const address = pendingWallets[index]?.address.toLowerCase()
          if (address) {
            acc[address] = "fail"
          }
        }
        return acc
      }, {})

      setWalletEligibility((prev) => ({ ...prev, ...finalState }))
    }

    runEligibility()

    return () => {
      isActive = false
    }
  }, [stage, user])

  const farcasterConnected = Boolean(user?.farcasterId)
  const githubConnected = Boolean(user?.github)
  const xConnected = Boolean(user?.twitter)

  const sortedWallets = useMemo(() => {
    return (user?.addresses ?? [])
      .slice()
      .sort((a, b) => Number(b.primary) - Number(a.primary))
  }, [user?.addresses])

  const canContinueSocial = farcasterConnected || githubConnected || xConnected
  const canContinueWallets = useMemo(
    () => Object.values(walletEligibility).some((status) => status === "pass"),
    [walletEligibility],
  )
  const canContinueGovernance = Boolean(selectedGovernance)

  const stepIndex = Math.max(0, STEP_ORDER.indexOf(stage))
  const stepLabel =
    stage === RegistrationStage.Checking
      ? "Checking your eligibility"
      : `${stepIndex + 1} of ${STEP_ORDER.length}`

  const handleClose = useCallback(
    (nextOpen: boolean, options?: { refresh?: boolean }) => {
      if (!nextOpen && isPrivyModalOpen) {
        return
      }

      if (!nextOpen) {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(S9_REGISTRATION_DIALOG_STORAGE_KEY)
        }
        setOpenDialog(undefined)
        onOpenChange(false)
        if (options?.refresh) {
          router.refresh()
        }
      } else {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(S9_REGISTRATION_DIALOG_STORAGE_KEY, "true")
        }
        onOpenChange(nextOpen)
      }
    },
    [isPrivyModalOpen, onOpenChange, setOpenDialog, router],
  )

  const handleRegister = useCallback(async (): Promise<boolean> => {
    if (!userId || !selectedGovernance) {
      return false
    }

    setIsRegistering(true)
    setStage(RegistrationStage.Checking)
    setResult(null)

    try {
      const normalizedGovernance = selectedGovernance.toLowerCase()
      const canonicalAddress =
        sortedWallets.find(
          (wallet) => wallet.address.toLowerCase() === normalizedGovernance,
        )?.address ?? selectedGovernance

      try {
        await makeUserAddressPrimaryAction(getAddress(canonicalAddress))
        await invalidateUserQueries()
      } catch (error) {
        console.error("Failed to set governance wallet as primary", error)
        setStage(RegistrationStage.ResultError)
        return false
      }

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

      return true
    } catch (error) {
      console.error("Error checking S9 eligibility", error)
      setStage(RegistrationStage.ResultError)
      return false
    } finally {
      setIsRegistering(false)
    }

    // Fallback return
    return false
  }, [invalidateUserQueries, selectedGovernance, seasonId, sortedWallets, userId])

  const handleVerifyIdentity = useCallback(() => {
    handleClose(false)
    router.push("/profile/details")
  }, [handleClose, router])

  const handleWorldIdConnected = useCallback(() => {
    setVerificationStatus((prev) => ({ ...prev, world: true }))
  }, [])

  const handleStartParticipating = useCallback(() => {
    handleClose(false)
    router.push("/governance")
  }, [handleClose, router])

  const goToNext = useCallback(() => {
    setStage((current) => {
      if (current === RegistrationStage.ConnectSocial) {
        return RegistrationStage.LinkWallets
      }
      if (current === RegistrationStage.LinkWallets) {
        return RegistrationStage.SelectGovernance
      }
      return current
    })
  }, [])

  // Automatically transition from READY to issuing attestation
  useEffect(() => {
    if (stage !== RegistrationStage.ResultReady) {
      return
    }

    attestationTimeoutRef.current = window.setTimeout(async () => {
      setStage(RegistrationStage.ResultIssuingAttestation)

      if (!userId || !selectedGovernance) {
        setStage(RegistrationStage.ResultError)
        return
      }

      const attestationResult = await createS9Citizen({
        userId,
        governanceAddress: selectedGovernance,
        seasonId,
        trustBreakdown:
          result?.trust?.walletScores && result?.trust?.socialScores
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
        // Update result with the actual attestation error so it's displayed
        setResult((prev) => prev ? { ...prev, message: attestationResult.error } : prev)
        setStage(RegistrationStage.ResultError)
      }
    }, 5000)

    return () => {
      if (attestationTimeoutRef.current) {
        clearTimeout(attestationTimeoutRef.current)
        attestationTimeoutRef.current = null
      }
    }
  }, [stage, userId, selectedGovernance, seasonId, result])

  return {
    userId,
    user,
    isLoadingUser: isLoading,
    stage,
    stepLabel,
    showStepCounter: STEP_ORDER.includes(stage),
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
  }
}
