import "server-only"

import { Prisma, PrismaClient } from "@prisma/client"
import { isAddress } from "viem"

import { prisma } from "@/db/client"
import type { EntityObject, EntityRecords } from "@/db/users"
import {
  getAllContributors,
  getAllGithubRepoBuiulders,
  getAllOnchainBuilders,
} from "@/db/users"
import { withImpersonation } from "@/lib/db/sessionContext"

import type {
  Attestation,
  Badgeholder,
  Citizen,
  EasRecord,
  EasTimestamp,
  Entity,
  GovContribution,
  RfVoter,
  Vote,
} from "./types"

type TagEligibleRecord = {
  address: string
  email: string | null
}

const ENTITIES: Entity[] = [
  "citizen",
  "badgeholder",
  "gov_contribution",
  "rf_voter",
  "votes",
]

export function normalizeAddresses(addresses: string[]) {
  return Array.from(
    new Set(
      addresses
        .filter((address) => typeof address === "string" && isAddress(address))
        .map((address) => address.toLowerCase()),
    ),
  )
}

export async function isBadgeholderAddress(
  address: string,
  db: PrismaClient = prisma,
) {
  return isAnyBadgeholderAddress([address], db)
}

export async function isAnyBadgeholderAddress(
  addresses: string[],
  db: PrismaClient = prisma,
) {
  const normalizedAddresses = normalizeAddresses(addresses)

  if (normalizedAddresses.length === 0) return false

  const rows = await db.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS(
      SELECT 1
      FROM eas.badgeholder
      WHERE revoked_at IS NULL
        AND lower(address) IN (${Prisma.join(normalizedAddresses)})
      LIMIT 1
    ) AS "exists"
  `

  return Boolean(rows[0]?.exists)
}

export async function getAttestationsForAddresses(
  addresses: string[],
  db: PrismaClient = prisma,
) {
  const normalizedAddresses = normalizeAddresses(addresses)

  if (normalizedAddresses.length === 0) return []

  const [citizens, badgeholders, govContributions, rfVoters, votes] =
    await Promise.all([
      queryCitizens(normalizedAddresses, db),
      queryBadgeholders(normalizedAddresses, db),
      queryGovContributions(normalizedAddresses, db),
      queryRfVoters(normalizedAddresses, db),
      queryVotes(normalizedAddresses, db),
    ])

  return [
    ...citizens.map((item) => parseEntity(item, "citizen")),
    ...badgeholders.map((item) => parseEntity(item, "badgeholder")),
    ...govContributions.map((item) => parseEntity(item, "gov_contribution")),
    ...rfVoters.map((item) => parseEntity(item, "rf_voter")),
    ...votes.map((item) => parseEntity(item, "votes")),
  ]
}

export async function getTagEligibleRecords() {
  return withImpersonation(({ db }) => getTagEligibleRecordsWithClient(db))
}

export async function getTagEligibleRecordsWithClient(
  db: PrismaClient = prisma,
): Promise<EntityRecords> {
  const [
    citizen,
    gov_contribution,
    rf_voter,
    contributors,
    onchain_builders,
    github_repo_builders,
  ] = await Promise.all([
    queryTagEligibleRows(
      Prisma.sql`
        SELECT DISTINCT lower(address) AS address
        FROM eas.citizen
        WHERE revoked_at IS NULL
      `,
      db,
    ),
    queryTagEligibleRows(
      Prisma.sql`
        SELECT DISTINCT lower(address) AS address
        FROM eas.gov_contribution
        WHERE revoked_at IS NULL
          AND gov_season = ${"7"}
      `,
      db,
    ),
    queryTagEligibleRows(
      Prisma.sql`
        SELECT DISTINCT lower(address) AS address
        FROM eas.rf_voter
        WHERE revoked_at IS NULL
          AND voter_type = ${"Guest"}
      `,
      db,
    ),
    getAllContributors(db),
    getAllOnchainBuilders(db),
    getAllGithubRepoBuiulders(db),
  ])

  return {
    citizen,
    gov_contribution,
    rf_voter,
    contributors: contributorsToEntityRecords(contributors),
    onchain_builders: contributorsToEntityRecords(onchain_builders),
    github_repo_builders: contributorsToEntityRecords(github_repo_builders),
  }
}

export function parseEntity<T extends Entity>(
  item: EntityRow<T>,
  entity: T,
): Attestation {
  const config = entityConfigs[entity] as EntityConfig<EntityRow<T>>

  return {
    id: item.id,
    attester: item.attester,
    entity,
    address: item.address,
    name: config.getName(item),
    subtext: config.getSubtext(item),
    metadata: config.getMetadata(item),
  }
}

async function queryCitizens(addresses: string[], db: PrismaClient) {
  return db.$queryRaw<Citizen[]>`
    SELECT id, address, farcaster_id, selection_method, attester, created_at, revoked_at
    FROM eas.citizen
    WHERE revoked_at IS NULL
      AND lower(address) IN (${Prisma.join(addresses)})
  `
}

async function queryBadgeholders(addresses: string[], db: PrismaClient) {
  return db.$queryRaw<Badgeholder[]>`
    SELECT id, address, rpgf_round, referred_by, referred_method, attester, created_at, revoked_at
    FROM eas.badgeholder
    WHERE revoked_at IS NULL
      AND lower(address) IN (${Prisma.join(addresses)})
  `
}

async function queryGovContributions(addresses: string[], db: PrismaClient) {
  return db.$queryRaw<GovContribution[]>`
    SELECT id, address, gov_season, gov_role, attester, created_at, revoked_at
    FROM eas.gov_contribution
    WHERE revoked_at IS NULL
      AND lower(address) IN (${Prisma.join(addresses)})
  `
}

async function queryRfVoters(addresses: string[], db: PrismaClient) {
  return db.$queryRaw<RfVoter[]>`
    SELECT id, address, farcaster_id, round, voter_type, voting_group, selection_method, attester, created_at, revoked_at
    FROM eas.rf_voter
    WHERE revoked_at IS NULL
      AND lower(address) IN (${Prisma.join(addresses)})
  `
}

async function queryVotes(addresses: string[], db: PrismaClient) {
  return db.$queryRaw<Vote[]>`
    SELECT id, address, proposal_id, params, voter_id, attester, revoked_at, created_at, block_number
    FROM eas.votes
    WHERE revoked_at IS NULL
      AND lower(address) IN (${Prisma.join(addresses)})
  `
}

async function queryTagEligibleRows(
  easAddressQuery: Prisma.Sql,
  db: PrismaClient,
): Promise<EntityObject[]> {
  const rows = await db.$queryRaw<TagEligibleRecord[]>`
    WITH eas_records AS (${easAddressQuery})
    SELECT DISTINCT ON (lower(eas_records.address))
      eas_records.address,
      latest_email.email
    FROM eas_records
    JOIN "UserAddress" ua
      ON lower(ua.address) = lower(eas_records.address)
    JOIN "User" u
      ON u.id = ua."userId"
      AND u."deletedAt" IS NULL
    JOIN LATERAL (
      SELECT email
      FROM "UserEmail"
      WHERE "userId" = u.id
        AND email <> ''
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) latest_email ON true
    ORDER BY lower(eas_records.address), latest_email.email
  `

  return rows
    .filter((row): row is EntityObject => Boolean(row.email))
    .map((row) => ({
      address: row.address,
      email: row.email,
    }))
}

function contributorsToEntityRecords(
  contributors: { addresses: { address: string }[]; emails: { email: string }[] }[],
): EntityObject[] {
  return contributors.map((contributor) => ({
    address: contributor.addresses.at(-1)?.address ?? "",
    email: contributor.emails.at(-1)?.email ?? "",
  }))
}

function getDateFromTimestamp(timestamp: EasTimestamp) {
  if (timestamp instanceof Date) return timestamp

  const numericTimestamp =
    typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp)

  return new Date(numericTimestamp * 1000)
}

type EntityRow<T extends Entity> = T extends "citizen"
  ? Citizen
  : T extends "badgeholder"
    ? Badgeholder
    : T extends "gov_contribution"
      ? GovContribution
      : T extends "rf_voter"
        ? RfVoter
        : Vote

type EntityConfig<T extends EasRecord> = {
  getName: (item: T) => string
  getSubtext: (item: T) => string
  getMetadata: (item: T) => Record<string, any>
}

const entityConfigs = {
  citizen: {
    getName: () => "Citizen",
    getSubtext: (item: Citizen) =>
      `Since ${getDateFromTimestamp(item.created_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        },
      )}`,
    getMetadata: () => ({}),
  },
  badgeholder: {
    getName: () => "Retro Funding Voter",
    getSubtext: (item: Badgeholder) => `Round ${item.rpgf_round}`,
    getMetadata: () => ({}),
  },
  gov_contribution: {
    getName: (item: GovContribution) => item.gov_role,
    getSubtext: (item: GovContribution) => `Season ${item.gov_season}`,
    getMetadata: (item: GovContribution) => ({
      role: item.gov_role,
      season: item.gov_season,
    }),
  },
  rf_voter: {
    getName: () => "Retro Funding Voter",
    getSubtext: (item: RfVoter) =>
      `Voter Type: ${item.voter_type}; Round ${item.round}`,
    getMetadata: (item: RfVoter) => ({
      voterType: item.voter_type,
      round: item.round,
    }),
  },
  votes: {
    getName: () => "Vote",
    getSubtext: (item: Vote) => `Proposal ${item.proposal_id}`,
    getMetadata: (item: Vote) => ({
      proposalId: item.proposal_id,
      params: item.params,
      voterId: item.voter_id ?? item.voterId,
    }),
  },
} satisfies Record<Entity, EntityConfig<any>>

export const EAS_ENTITIES = ENTITIES
