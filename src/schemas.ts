import { parseAbiParameters } from "viem";
import schemas from "../schemas.config";

export const schemaSignatures = {
  citizen: parseAbiParameters("uint256 farcasterId,string selectionMethod"),
};

export const schemaIds: {
  [key: `0x${string}`]: keyof typeof schemaSignatures;
} = Object.fromEntries(
  Object.entries(schemas).map(([key, value]) => [
    value.id as `0x${string}`,
    key as keyof typeof schemaSignatures,
  ])
);
