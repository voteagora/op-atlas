import { ProjectContract } from "@prisma/client"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { type Address } from "viem"

import { Badge } from "@/components/common/Badge"
import { DialogProps } from "@/components/dialogs/types"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { verifyDeployer } from "@/lib/actions/contracts"
import { getMessage } from "@/lib/utils/contracts"

import { ChainSelector } from "./ChainSelector"
import { CHAIN_INFO } from "@/components/common/chain"

const defaultSelectedChain = 10

export function VerifyAddressDialog({
  open,
  onOpenChange,
  projectId,
  deployerAddress,
  expectedContracts,
  onSubmit,
}: DialogProps<{
  projectId: string
  deployerAddress: Address
  expectedContracts?: number
  onSubmit: (
    includedContracts: ProjectContract[],
    excludedContracts: ProjectContract[],
    signature: string,
    verificationChainId: string,
  ) => void
}>) {
  const [page, setPage] = useState(0)
  const [copied, setCopied] = useState(false)
  const [signature, setSignature] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState<{
    inserted: number
    total: number | null
  }>({ inserted: 0, total: expectedContracts ?? null })

  const baselineRef = useRef(0)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const isPolling = useRef(false)
  const expectedRef = useRef<number | undefined>(expectedContracts)

  useEffect(() => {
    expectedRef.current = expectedContracts
    setProgress((prev) => ({
      inserted: prev.inserted,
      total:
        typeof expectedContracts === "number" ? expectedContracts : prev.total,
    }))
  }, [expectedContracts])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const fetchCurrentCount = async () => {
    const res = await fetch(
      `/api/projects/${projectId}/contracts/count?deployer=${encodeURIComponent(
        deployerAddress,
      )}`,
      { cache: "no-store" },
    )
    if (!res.ok) {
      throw new Error("Failed to fetch contract count")
    }
    const data = (await res.json()) as { count?: number }
    return data.count ?? 0
  }

  const startPolling = () => {
    if (isPolling.current) return
    isPolling.current = true
    pollingRef.current = setInterval(async () => {
      try {
        const current = await fetchCurrentCount()
        setProgress((prev) => ({
          inserted: Math.max(0, current - baselineRef.current),
          total:
            typeof expectedRef.current === "number"
              ? expectedRef.current
              : prev.total,
        }))
        if (current > baselineRef.current) {
          setShowProgress(true)
        }
        if (
          typeof expectedRef.current === "number" &&
          current - baselineRef.current >= expectedRef.current
        ) {
          stopPolling()
        }
      } catch (pollError) {
        console.error("Failed to poll contract count", pollError)
      }
    }, 1000)
  }

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    isPolling.current = false
  }

  const onCopy = () => {
    navigator.clipboard.writeText(getMessage(projectId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [selectedChain, setSelectedChain] =
    useState<number>(defaultSelectedChain)

  const [chainInfo, setChainInfo] = useState<{
    logo: string
    name: string
    blockExplorer?: string
  }>(CHAIN_INFO[selectedChain.toString()])

  const onConfirmSignature = async () => {
    try {
      setLoading(true)
       setError(undefined)

      const baseline = await fetchCurrentCount()
      baselineRef.current = baseline
      setProgress({
        inserted: 0,
        total:
          typeof expectedRef.current === "number"
            ? expectedRef.current
            : progress.total,
      })
      startPolling()

      const verificationResult = await verifyDeployer(
        projectId,
        deployerAddress,
        selectedChain!,
        signature as `0x${string}`,
      )

      if (verificationResult.error !== null) {
        setError(verificationResult.error)
        return
      }

      setError(undefined)
      // Ensure final numbers are reflected once the action resolves
      try {
        const current = await fetchCurrentCount()
        setProgress((prev) => ({
          inserted: Math.max(0, current - baselineRef.current),
          total:
            typeof expectedRef.current === "number"
              ? expectedRef.current
              : prev.total,
        }))
        if (current > baselineRef.current) {
          setShowProgress(true)
        }
      } catch (countError) {
        console.error("Failed to fetch final contract count", countError)
      }

      onSubmit(
        verificationResult.contracts.included as ProjectContract[],
        verificationResult.contracts.excluded as ProjectContract[],
        signature,
        selectedChain.toString(),
      )
    } catch (_) {
      setError("An error occurred, please try again")
    } finally {
      setLoading(false)
      stopPolling()
      const finalInserted = Math.max(
        0,
        (await fetchCurrentCount().catch(() => baselineRef.current)) -
          baselineRef.current,
      )
      setProgress((prev) => ({
        inserted: finalInserted,
        total:
          typeof expectedRef.current === "number"
            ? expectedRef.current
            : prev.total,
      }))
      setShowProgress(false)
    }
  }

  async function onChainChange(value: string) {
    setSelectedChain(parseInt(value))
    const chainInfo = CHAIN_INFO[value]
    const chainInfoHasBlockExplorer = chainInfo?.blockExplorer
    setChainInfo(
      chainInfoHasBlockExplorer
        ? chainInfo
        : CHAIN_INFO[defaultSelectedChain.toString()],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex items-center justify-center">
          <DialogTitle className="flex flex-col items-center gap-4">
            <Badge text={page === 0 ? "Verify deployer" : "Verify contract"} />
            <span className="text-base font-semibold text-center">
              {page === 0
                ? "Copy and sign the message below using your preferred provider"
                : "Enter the resulting signature hash from your signed message"}
            </span>
          </DialogTitle>
        </DialogHeader>
        {page === 0 && (
          <>
            <div className="flex flex-col self-stretch gap-1">
              <ChainSelector
                defaultValue={defaultSelectedChain.toString()}
                onChange={onChainChange}
              />
            </div>
            <div className="flex flex-col self-stretch gap-1">
              <FormLabel>Message to sign</FormLabel>
              <Textarea
                disabled
                value={getMessage(projectId)}
                className="resize-none"
              />
              <Button type="button" onClick={onCopy} variant="secondary">
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <Button
              className="self-stretch"
              variant="destructive"
              type="button"
              onClick={() => setPage(1)}
            >
              Continue
            </Button>
          </>
        )}
        {page === 1 && (
          <>
            <Button
              variant="ghost"
              type="button"
              className="p-1 absolute left-[12px] top-[12px]"
              onClick={() => setPage(0)}
            >
              <Image
                src="/assets/icons/arrowLeftIcon.svg"
                width={13}
                height={12}
                alt="Back"
              />
            </Button>
            <div className="flex flex-col self-stretch gap-1">
              <FormLabel>Signature hash</FormLabel>
              <Textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="resize-none"
              />
              {error && (
                <p className="text-destructive text-sm font-normal">{error}</p>
              )}
            </div>
            <Button
              className="self-stretch disabled:bg-destructive/80 disabled:text-white"
              variant="destructive"
              type="button"
              disabled={!signature || loading}
              onClick={onConfirmSignature}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {showProgress ? (
                    typeof progress.total === "number" &&
                    progress.inserted >= progress.total ? (
                      <span className="text-sm font-medium">
                        Finalizing…
                      </span>
                    ) : (
                      <span className="text-sm font-medium">
                        {progress.inserted}
                        {progress.total !== null
                          ? ` / ${progress.total}`
                          : null}{" "}
                        contracts processed
                      </span>
                    )
                  ) : (
                    <span className="text-sm font-medium">Verifying…</span>
                  )}
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
