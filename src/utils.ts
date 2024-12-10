import { parseAbiParameters, AbiParametersToPrimitiveTypes } from "abitype";
import { decodeAbiParameters, hexToBytes } from "viem";

/**
 * Decodes encoded data (hex string) based on a provided data signature.
 * Uses `abitype` for automatic type inference.
 *
 * @param encodedData - The encoded data as a hex string.
 * @param dataSignature - The data signature, e.g., "(string rpgfRound,address referredBy,string referredMethod)".
 * @returns The decoded tuple of values with inferred types.
 */
export function decodeData<TSignature extends string>(
  encodedData: `0x${string}`,
  dataSignature: TSignature
) {
  const cleanSignature = dataSignature.startsWith("0x")
    ? dataSignature.slice(2)
    : dataSignature;

  const abiParameters = parseAbiParameters(cleanSignature);

  return decodeAbiParameters(
    abiParameters,
    hexToBytes(encodedData)
  ) as AbiParametersToPrimitiveTypes<typeof abiParameters>;
}
