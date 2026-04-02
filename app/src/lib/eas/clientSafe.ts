// This file exports EAS constants safe for client-side usage.

import {
  EAS_DEFAULT_CHAIN_IDS,
  EAS_DEFAULT_CONTRACT_ADDRESSES,
  EAS_DEFAULT_SCHEMA_IDS,
  EAS_SCHEMA_STRINGS,
  getEasEnvironmentProfile,
} from "./schemaDefinitions"

const easEnvironment = getEasEnvironmentProfile()
const configuredVotesSchemaId =
  process.env.NEXT_PUBLIC_EAS_SCHEMA_VOTES_ID?.trim()
const configuredEasAddress =
  process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS?.trim()

export const OFFCHAIN_VOTE_SCHEMA_ID =
  (configuredVotesSchemaId && configuredVotesSchemaId.length > 0
    ? configuredVotesSchemaId
    : undefined) ?? EAS_DEFAULT_SCHEMA_IDS[easEnvironment].votes

export const EAS_CONTRACT_ADDRESS =
  (configuredEasAddress && configuredEasAddress.length > 0
    ? configuredEasAddress
    : undefined) ?? EAS_DEFAULT_CONTRACT_ADDRESSES[easEnvironment]

export const EAS_VOTE_SCHEMA = EAS_SCHEMA_STRINGS.votes

export const CHAIN_ID = EAS_DEFAULT_CHAIN_IDS[easEnvironment]
