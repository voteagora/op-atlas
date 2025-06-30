import { onchainTable } from "ponder";

export const citizen = onchainTable("citizen", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  farcaster_id: t.text().notNull(),
  selection_method: t.text().notNull(),
  attester: t.text().notNull(),
  created_at: t.bigint().notNull(),
  revoked_at: t.bigint(),
}));

export const badgeholder = onchainTable("badgeholder", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  rpgf_round: t.text().notNull(),
  referred_by: t.text().notNull(),
  referred_method: t.text(),
  attester: t.text().notNull(),
  created_at: t.bigint().notNull(),
  revoked_at: t.bigint(),
}));

export const gov_contribution = onchainTable("gov_contribution", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  gov_season: t.text().notNull(),
  gov_role: t.text().notNull(),
  attester: t.text().notNull(),
  revoked_at: t.bigint(),
  created_at: t.bigint().notNull(),
}));

export const rf_voter = onchainTable("rf_voter", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  farcaster_id: t.text().notNull(),
  round: t.text().notNull(),
  voter_type: t.text().notNull(),
  voting_group: t.text().notNull(),
  selection_method: t.text().notNull(),
  attester: t.text().notNull(),
  revoked_at: t.bigint(),
  created_at: t.bigint().notNull(),
}));

export const votes = onchainTable("votes", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  proposal_id: t.text().notNull(),
  params: t.text().notNull(),
  voterId: t.text().notNull(),
  attester: t.text().notNull(),
  revoked_at: t.bigint(),
  created_at: t.bigint().notNull(),
}));
