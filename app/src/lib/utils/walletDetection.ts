export type WalletType = "eoa" | "eip7702" | "smart_contract"

const EIP_7702_DELEGATION_PREFIX = "0xef0100"

export async function detectWalletType(
  provider: any,
  address: string,
): Promise<WalletType> {
  try {
    const ethereum = (window as any).ethereum
    if (ethereum?.isSafe || ethereum?.isGnosisSafe) {
      return "smart_contract"
    }

    const code = await provider.getCode(address)
    if (code === "0x") return "eoa"
    if (code.toLowerCase().startsWith(EIP_7702_DELEGATION_PREFIX))
      return "eip7702"
    return "smart_contract"
  } catch (error) {
    return "eoa"
  }
}

export async function isSmartContractWallet(
  provider: any,
  address: string,
): Promise<boolean> {
  const type = await detectWalletType(provider, address)
  return type === "smart_contract"
}

/** @deprecated Use isSmartContractWallet instead */
export const isMultisigWallet = isSmartContractWallet
