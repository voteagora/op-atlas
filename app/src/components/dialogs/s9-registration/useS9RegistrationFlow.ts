"use client"

import { useModalStatus } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getAddress } from "viem"

import { makeUserAddressPrimaryAction } from "@/app/profile/verified-addresses/actions"
import {
  USER_ADDRESSES_QUERY_KEY,
  USER_QUERY_KEY,
  useUser,
} from "@/hooks/db/useUser"
import { usePrivyFarcaster } from "@/hooks/privy/usePrivyFarcaster"
import { usePrivyLinkGithub } from "@/hooks/privy/usePrivyLinkGithub"
import { usePrivyLinkTwitter } from "@/hooks/privy/usePrivyLinkTwitter"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import {
  checkWalletEligibility,
  s9Qualification,
  S9QualificationResult,
} from "@/lib/actions/citizenship/s9Qualification"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import { withMiradorTraceHeaders } from "@/lib/mirador/headers"
import {
  addMiradorEvent,
  closeMiradorTrace,
  startMiradorTrace,
} from "@/lib/mirador/webTrace"
import { buildFrontendTraceContext } from "@/lib/mirador/clientTraceContext"
import { useAppDialogs } from "@/providers/DialogProvider"

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
type MiradorTraceInstance = NonNullable<ReturnType<typeof startMiradorTrace>>
type CreateS9CitizenResponse = {
  success: boolean
  attestationId?: string
  error?: string
}

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
  sortedWallets: Array<{
    address: string
    primary: boolean
    source?: string | null
  }>
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
  const [stage, setStage] = useState<RegistrationStage>(
    RegistrationStage.ConnectSocial,
  )
  const [selectedWallets, setSelectedWallets] = useState<string[]>([])
  const [selectedGovernance, setSelectedGovernance] = useState<string | null>(
    null,
  )
  const [walletEligibility, setWalletEligibility] =
    useState<WalletEligibilityState>({})
  const [result, setResult] = useState<S9QualificationResult | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState({
    kyc: false,
    world: false,
  })

  const walletEligibilityRef = useRef<WalletEligibilityState>({})
  const stageRef = useRef<RegistrationStage>(RegistrationStage.ConnectSocial)
  const registrationTraceRef =
    useRef<ReturnType<typeof startMiradorTrace>>(null)
  const pendingUnmountCloseTimeoutRef = useRef<number | null>(null)
  const walletEligibilityRunKeyRef = useRef<string | null>(null)
  const walletEligibilityPromiseRef =
    useRef<Promise<WalletEligibilityState> | null>(null)

  useEffect(() => {
    walletEligibilityRef.current = walletEligibility
  }, [walletEligibility])
  useEffect(() => {
    stageRef.current = stage
  }, [stage])

  const attestationTimeoutRef = useRef<number | null>(null)

  const cancelPendingUnmountClose = useCallback(() => {
    if (pendingUnmountCloseTimeoutRef.current !== null) {
      window.clearTimeout(pendingUnmountCloseTimeoutRef.current)
      pendingUnmountCloseTimeoutRef.current = null
    }
  }, [])

  const getRegistrationTraceId = useCallback(() => {
    return registrationTraceRef.current?.getTraceId() ?? null
  }, [])

  const createS9CitizenWithTrace = useCallback(
    async ({
      traceId,
      userId,
      governanceAddress,
      seasonId,
      trustBreakdown,
    }: {
      traceId: string | null
      userId: string
      governanceAddress: string
      seasonId: string
      trustBreakdown?: unknown
    }): Promise<CreateS9CitizenResponse> => {
      const response = await fetch("/api/v1/citizenship/s9/register", {
        method: "POST",
        headers: withMiradorTraceHeaders(
          {
            "Content-Type": "application/json",
          },
          traceId,
          MIRADOR_FLOW.citizenS9Registration,
        ),
        body: JSON.stringify({
          userId,
          governanceAddress,
          seasonId,
          trustBreakdown,
        }),
      })

      const payload = (await response.json()) as CreateS9CitizenResponse & {
        error?: string
      }

      if (!response.ok) {
        return {
          success: false,
          error: payload.error ?? "Failed to register S9 citizenship",
        }
      }

      return payload
    },
    [],
  )

  const closeRegistrationTrace = useCallback(
    async (
      reason: string,
      eventName?: string,
      details?: Record<string, unknown>,
    ) => {
      const trace = registrationTraceRef.current
      if (!trace) {
        return
      }
      cancelPendingUnmountClose()

      if (eventName) {
        addMiradorEvent(trace, eventName, details)
      }

      await closeMiradorTrace(trace, reason)
      registrationTraceRef.current = null
    },
    [cancelPendingUnmountClose],
  )

  const invalidateUserQueries = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, userId] }),
      queryClient.invalidateQueries({
        queryKey: [USER_ADDRESSES_QUERY_KEY, userId],
      }),
    ]).then(() => undefined)
  }, [queryClient, userId])

  useEffect(() => {
    cancelPendingUnmountClose()

    if (!open) {
      const trace = registrationTraceRef.current
      if (trace) {
        addMiradorEvent(trace, "s9_registration_dialog_closed", {
          stage: stageRef.current,
          seasonId,
        })
        void closeMiradorTrace(trace, "S9 registration dialog closed")
        registrationTraceRef.current = null
      }
      return
    }

    if (registrationTraceRef.current) {
      return
    }

    const trace = startMiradorTrace({
      name: "S9CitizenRegistration",
      flow: MIRADOR_FLOW.citizenS9Registration,
      context: {
        source: "frontend",
        userId,
        farcasterId: user?.farcasterId ?? undefined,
        sessionId: userId,
      },
      attributes: {
        seasonId,
        stage: RegistrationStage.ConnectSocial,
      },
      tags: ["citizen", "registration", "s9", "frontend"],
    })

    registrationTraceRef.current = trace
    addMiradorEvent(trace, "s9_registration_dialog_opened", {
      seasonId,
      stage: RegistrationStage.ConnectSocial,
    })
  }, [cancelPendingUnmountClose, open, seasonId, user?.farcasterId, userId])

  useEffect(() => {
    return () => {
      const trace = registrationTraceRef.current
      if (trace) {
        cancelPendingUnmountClose()
        pendingUnmountCloseTimeoutRef.current = window.setTimeout(() => {
          if (registrationTraceRef.current !== trace) {
            return
          }

          addMiradorEvent(trace, "s9_registration_trace_closed_on_unmount", {
            seasonId,
          })
          void closeMiradorTrace(trace, "S9 registration hook unmounted")
          registrationTraceRef.current = null
          pendingUnmountCloseTimeoutRef.current = null
        }, 0)
      }
    }
  }, [cancelPendingUnmountClose, seasonId])

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

    const wallets = (user.addresses ?? []).map((addr) =>
      addr.address.toLowerCase(),
    )
    setSelectedWallets(wallets)

    const primary = user.addresses
      ?.find((addr) => addr.primary)
      ?.address?.toLowerCase()
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

    const pendingAddresses = pendingWallets
      .map((wallet) => wallet.address.toLowerCase())
      .sort()
    const runKey = pendingAddresses.join(",")

    let isActive = true

    let runPromise = walletEligibilityPromiseRef.current
    if (walletEligibilityRunKeyRef.current !== runKey || !runPromise) {
      addMiradorEvent(
        registrationTraceRef.current,
        "s9_registration_wallet_eligibility_started",
        {
          walletCount: pendingWallets.length,
          addresses: pendingAddresses,
        },
      )

      const checkingState = pendingWallets.reduce<WalletEligibilityState>(
        (acc, wallet) => {
          acc[wallet.address.toLowerCase()] = "checking"
          return acc
        },
        {},
      )

      setWalletEligibility((prev) => ({ ...prev, ...checkingState }))

      runPromise = Promise.allSettled(
        pendingWallets.map(async (wallet) => {
          const address = wallet.address.toLowerCase()
          try {
            const response = await checkWalletEligibility(address)
            return {
              address,
              status: response.eligible ? "pass" : "fail",
            } as const
          } catch (error) {
            console.error(`Error checking wallet ${address}:`, error)
            return { address, status: "fail" as const }
          }
        }),
      ).then((results) => {
        return results.reduce<WalletEligibilityState>((acc, outcome, index) => {
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
      })

      walletEligibilityRunKeyRef.current = runKey
      walletEligibilityPromiseRef.current = runPromise
    }

    runPromise
      .then((finalState) => {
        if (!isActive) return

        setWalletEligibility((prev) => ({ ...prev, ...finalState }))
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_wallet_eligibility_completed",
          {
            outcomes: finalState,
          },
        )
      })
      .catch((error) => {
        if (!isActive) return
        console.error("Wallet eligibility check failed", error)
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_wallet_eligibility_failed",
          {
            error: error instanceof Error ? error.message : String(error),
          },
        )
      })
      .finally(() => {
        if (
          walletEligibilityRunKeyRef.current === runKey &&
          walletEligibilityPromiseRef.current === runPromise
        ) {
          walletEligibilityRunKeyRef.current = null
          walletEligibilityPromiseRef.current = null
        }
      })

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
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_close_requested",
          {
            stage,
            seasonId,
            refresh: Boolean(options?.refresh),
          },
        )
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(S9_REGISTRATION_DIALOG_STORAGE_KEY)
        }
        setOpenDialog(undefined)
        onOpenChange(false)
        void closeRegistrationTrace(
          "S9 registration dialog closed by user",
          "s9_registration_trace_closed",
          { stage, seasonId },
        )
        if (options?.refresh) {
          router.refresh()
        }
      } else {
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_open_requested",
          {
            stage,
            seasonId,
          },
        )
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            S9_REGISTRATION_DIALOG_STORAGE_KEY,
            "true",
          )
        }
        onOpenChange(nextOpen)
      }
    },
    [
      closeRegistrationTrace,
      isPrivyModalOpen,
      onOpenChange,
      router,
      seasonId,
      setOpenDialog,
      stage,
    ],
  )

  const handleRegister = useCallback(async (): Promise<boolean> => {
    if (!userId || !selectedGovernance) {
      addMiradorEvent(
        registrationTraceRef.current,
        "s9_registration_check_skipped",
        {
          reason: "missing_user_or_governance",
          hasUserId: Boolean(userId),
          hasSelectedGovernance: Boolean(selectedGovernance),
        },
      )
      return false
    }

    if (!registrationTraceRef.current) {
      const trace = startMiradorTrace({
        name: "S9CitizenRegistration",
        flow: MIRADOR_FLOW.citizenS9Registration,
        context: {
          source: "frontend",
          userId,
          farcasterId: user?.farcasterId ?? undefined,
          walletAddress: selectedGovernance,
          sessionId: userId,
        },
        attributes: {
          seasonId,
          stage: RegistrationStage.Checking,
        },
        tags: ["citizen", "registration", "s9", "frontend"],
      })
      registrationTraceRef.current = trace
      addMiradorEvent(trace, "s9_registration_trace_restarted", {
        seasonId,
      })
    }

    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_check_started",
      {
        seasonId,
        governanceAddress: selectedGovernance,
        socialConnected: {
          farcasterConnected,
          githubConnected,
          xConnected,
        },
        walletCount: sortedWallets.length,
      },
    )
    setIsRegistering(true)
    setStage(RegistrationStage.Checking)
    setResult(null)

    try {
      const normalizedGovernance = selectedGovernance.toLowerCase()
      const canonicalAddress =
        sortedWallets.find(
          (wallet) => wallet.address.toLowerCase() === normalizedGovernance,
        )?.address ?? selectedGovernance

      addMiradorEvent(
        registrationTraceRef.current,
        "s9_registration_governance_selected",
        {
          governanceAddress: canonicalAddress,
        },
      )

      try {
        const traceContext = buildFrontendTraceContext(
          registrationTraceRef.current,
          {
            flow: MIRADOR_FLOW.citizenS9Registration,
            step: "s9_registration_governance_set_primary",
            userId,
            farcasterId: user?.farcasterId ?? undefined,
            walletAddress: canonicalAddress,
            sessionId: userId,
          },
        )
        await makeUserAddressPrimaryAction(
          getAddress(canonicalAddress),
          traceContext,
        )
        await invalidateUserQueries()
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_governance_saved",
          {
            governanceAddress: canonicalAddress,
          },
        )
      } catch (error) {
        console.error("Failed to set governance wallet as primary", error)
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_governance_save_failed",
          {
            governanceAddress: canonicalAddress,
            error: error instanceof Error ? error.message : String(error),
          },
        )
        setStage(RegistrationStage.ResultError)
        return false
      }

      const response = await s9Qualification({
        userId,
        governanceAddress: selectedGovernance,
        seasonId,
      })

      addMiradorEvent(
        registrationTraceRef.current,
        "s9_registration_qualification_received",
        {
          seasonId,
          status: response.status,
          kycApproved: response.kycApproved,
          worldIdVerified: response.worldIdVerified,
        },
      )

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
      addMiradorEvent(
        registrationTraceRef.current,
        "s9_registration_qualification_failed",
        {
          seasonId,
          error: error instanceof Error ? error.message : String(error),
        },
      )
      setStage(RegistrationStage.ResultError)
      return false
    } finally {
      setIsRegistering(false)
    }

    // Fallback return
    return false
  }, [
    getRegistrationTraceId,
    farcasterConnected,
    githubConnected,
    invalidateUserQueries,
    seasonId,
    selectedGovernance,
    sortedWallets,
    user?.farcasterId,
    userId,
    xConnected,
  ])

  const handleVerifyIdentity = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_verify_identity_selected",
      {
        stage,
      },
    )
    handleClose(false)
    router.push("/profile/details")
  }, [handleClose, router, stage])

  const handleWorldIdConnected = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_world_id_connected",
      {
        stage,
      },
    )
    setVerificationStatus((prev) => ({ ...prev, world: true }))
  }, [stage])

  const handleStartParticipating = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_start_participating",
      {
        stage,
      },
    )
    handleClose(false)
    router.push("/governance")
  }, [handleClose, router, stage])

  const goToNext = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_step_continue",
      {
        currentStage: stage,
      },
    )
    setStage((current) => {
      if (current === RegistrationStage.ConnectSocial) {
        return RegistrationStage.LinkWallets
      }
      if (current === RegistrationStage.LinkWallets) {
        return RegistrationStage.SelectGovernance
      }
      return current
    })
  }, [stage])

  useEffect(() => {
    if (!registrationTraceRef.current) {
      return
    }

    if (
      stage !== RegistrationStage.ResultNotEligible &&
      stage !== RegistrationStage.ResultPriority &&
      stage !== RegistrationStage.ResultClosed &&
      stage !== RegistrationStage.ResultAlreadyRegistered &&
      stage !== RegistrationStage.ResultError
    ) {
      return
    }

    void closeRegistrationTrace(
      `S9 registration finished with status: ${stage}`,
      "s9_registration_trace_closed_terminal_status",
      { stage, seasonId },
    )
  }, [closeRegistrationTrace, seasonId, stage])

  // Automatically transition from READY to issuing attestation
  useEffect(() => {
    if (stage !== RegistrationStage.ResultReady) {
      return
    }

    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_ready_for_attestation",
      {
        seasonId,
        selectedGovernance,
      },
    )

    attestationTimeoutRef.current = window.setTimeout(async () => {
      setStage(RegistrationStage.ResultIssuingAttestation)
      addMiradorEvent(
        registrationTraceRef.current,
        "s9_registration_attestation_started",
        {
          seasonId,
          governanceAddress: selectedGovernance,
        },
      )

      if (!userId || !selectedGovernance) {
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_attestation_failed",
          {
            reason: "missing_user_or_governance",
            hasUserId: Boolean(userId),
            hasSelectedGovernance: Boolean(selectedGovernance),
          },
        )
        setStage(RegistrationStage.ResultError)
        return
      }

      const traceId = getRegistrationTraceId()
      const attestationResult = await createS9CitizenWithTrace({
        traceId,
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
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_attestation_succeeded",
          {
            seasonId,
            governanceAddress: selectedGovernance,
            attestationId: attestationResult.attestationId,
          },
        )
        setStage(RegistrationStage.ResultFinalSuccess)
        await closeRegistrationTrace(
          "S9 registration completed",
          "s9_registration_trace_closed_success",
          {
            seasonId,
            governanceAddress: selectedGovernance,
            attestationId: attestationResult.attestationId,
          },
        )
      } else {
        addMiradorEvent(
          registrationTraceRef.current,
          "s9_registration_attestation_failed",
          {
            seasonId,
            governanceAddress: selectedGovernance,
            error: attestationResult.error,
          },
        )
        // Update result with the actual attestation error so it's displayed
        setResult((prev) =>
          prev ? { ...prev, message: attestationResult.error } : prev,
        )
        setStage(RegistrationStage.ResultError)
        await closeRegistrationTrace(
          "S9 registration attestation failed",
          "s9_registration_trace_closed_failure",
          {
            seasonId,
            governanceAddress: selectedGovernance,
            error: attestationResult.error,
          },
        )
      }
    }, 5000)

    return () => {
      if (attestationTimeoutRef.current) {
        clearTimeout(attestationTimeoutRef.current)
        attestationTimeoutRef.current = null
      }
    }
  }, [
    closeRegistrationTrace,
    createS9CitizenWithTrace,
    getRegistrationTraceId,
    result,
    seasonId,
    selectedGovernance,
    stage,
    userId,
  ])

  const handleSetSelectedGovernance = useCallback(
    (address: string | null) => {
      addMiradorEvent(
        registrationTraceRef.current,
        "s9_registration_governance_changed",
        {
          previousGovernance: selectedGovernance,
          nextGovernance: address,
        },
      )
      setSelectedGovernance(address)
    },
    [selectedGovernance],
  )

  const handleLinkWallet = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_wallet_link_requested",
      {
        stage,
        selectedWalletCount: selectedWallets.length,
      },
    )
    linkWallet()
  }, [linkWallet, selectedWallets.length, stage])

  const handleLinkFarcaster = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_farcaster_link_requested",
      {
        stage,
      },
    )
    linkFarcaster()
  }, [linkFarcaster, stage])

  const handleLinkGithub = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_github_link_requested",
      {
        stage,
      },
    )
    linkGithub()
  }, [linkGithub, stage])

  const handleLinkTwitter = useCallback(() => {
    addMiradorEvent(
      registrationTraceRef.current,
      "s9_registration_twitter_link_requested",
      {
        stage,
      },
    )
    linkTwitter()
  }, [linkTwitter, stage])

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
      setSelectedGovernance: handleSetSelectedGovernance,
      handleRegister,
      handleVerifyIdentity,
      handleWorldIdConnected,
      handleStartParticipating,
      linkWallet: handleLinkWallet,
      linkFarcaster: handleLinkFarcaster,
      linkGithub: handleLinkGithub,
      linkTwitter: handleLinkTwitter,
    },
  }
}
