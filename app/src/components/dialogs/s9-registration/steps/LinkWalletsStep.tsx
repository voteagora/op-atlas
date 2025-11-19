"use client"

import Link from "next/link"
import { Loader2, Wallet } from "lucide-react"
import { isAddress } from "viem"

import { Button as CommonButton } from "@/components/common/Button"
import { truncateAddress } from "@/lib/utils/string"
import { useEnsName } from "@/hooks/useEnsName"
import { CheckboxCircleFIll, CloseCircleFill } from "@/components/icons/remix"

type LinkWalletsStepProps = {
  wallets: Array<{ address: string; primary: boolean }>
  walletEligibility: Record<string, "checking" | "pass" | "fail">
  onLinkWallet: () => void
}

export function LinkWalletsStep({
  wallets,
  walletEligibility,
  onLinkWallet,
}: LinkWalletsStepProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-foreground mt-4 text-center">
          Link a wallet with Superchain activity
        </h3>
        <div className="text-center text-secondary-foreground underline">
          <Link href="https://community.optimism.io/citizens-house/citizenship-eligibility-requirements" target="_blank">
            View requirements
          </Link>
        </div>
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
              <CommonButton variant="secondary" onClick={onLinkWallet} className="h-8">
                Link
              </CommonButton>
            </div>
          </div>
        ) : (
          wallets.map((wallet) => (
            <WalletEligibilityRow
              key={wallet.address}
              address={wallet.address}
              status={walletEligibility[wallet.address.toLowerCase()] || "checking"}
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

  const statusLabel =
    status === "checking" ? "Checking" : status === "pass" ? "Pass" : "Insufficient activity"

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-secondary px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        {ensName && <span>{ensName}</span>}
        <span className={ensName ? "text-muted-foreground" : ""}>
          {truncateAddress(address)}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-foreground">
        {status === "checking" && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === "pass" && <CheckboxCircleFIll className="w-4 h-4" fill="#0DA529" />}
        {status === "fail" && <CloseCircleFill className="w-4 h-4" fill="hsl(var(--destructive))" />}
        <span>{statusLabel}</span>
      </div>
    </div>
  )
}
