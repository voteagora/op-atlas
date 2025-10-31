"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge as VerificationBadge } from "@/components/common/Badge"
import { Badgeholder } from "@/components/common/Badgeholder"
import { truncateAddress } from "@/lib/utils/string"
import { useEnsName } from "@/hooks/useEnsName"
import { useBadgeholderAddress } from "@/lib/hooks"
import { isAddress } from "viem"

type SelectGovernanceStepProps = {
  wallets: Array<{ address: string; primary: boolean; source?: string | null }>
  selectedWallets: string[]
  selectedGovernance: string | null
  setSelectedGovernance: (address: string | null) => void
}

export function SelectGovernanceStep({
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
        If you're found eligible, where should we issue your citizen badge?
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

function WalletSelectionRow({ address, value, primary, source }: WalletSelectionRowProps) {
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
