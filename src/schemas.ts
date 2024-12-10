import { parseAbiParameters } from "viem";

export const schemaSignatures = {
  citizen: parseAbiParameters("uint256 farcasterId,string selectionMethod"),
};

export const schemaIds = {
  "0x5ebff8ad62d203585850493a9699d7f32d0de739ff7f7421f1ad64d6ddf7749d":
    "citizen",
} as { [key: `0x${string}`]: keyof typeof schemaSignatures };
