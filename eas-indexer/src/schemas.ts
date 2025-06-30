import { parseAbiParameters } from "viem";
import schemas from "../schemas.config";

export const schemaSignatures = {
  citizen: parseAbiParameters("uint256 farcasterId,string selectionMethod"),
  badgeholder: parseAbiParameters(
    "string rpgfRound,address referredBy,string referredMethod"
  ),
  gov_contribution: parseAbiParameters("string govSeason,string govRole"),
  rf_voter: parseAbiParameters(
    "uint256 farcasterID,string round,string voterType,string votingGroup,string selectionMethod"
  ),
  votes: parseAbiParameters("uint256 proposalId,string params"),
};

export const schemaIds: {
  [key: `0x${string}`]: keyof typeof schemaSignatures;
} = Object.fromEntries(
  Object.entries(schemas).map(([key, value]) => [
    value.id as `0x${string}`,
    key as keyof typeof schemaSignatures,
  ])
);
