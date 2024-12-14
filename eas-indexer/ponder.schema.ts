import { onchainTable } from "@ponder/core";

export const citizen = onchainTable("citizen", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  farcaster_id: t.text().notNull(),
  selection_method: t.text().notNull(),
  revoked: t.boolean().notNull(),
}));

export const badgeholder = onchainTable("badgeholder", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  rpgf_round: t.text().notNull(),
  referred_by: t.text().notNull(),
  referred_method: t.text(),
  revoked: t.boolean().notNull(),
}));

export const gov_contribution = onchainTable("gov_contribution", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  gov_season: t.text().notNull(),
  gov_role: t.text().notNull(),
  revoked: t.boolean().notNull(),
}));

export const rf_voter = onchainTable("rf_voter", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  farcaster_id: t.text().notNull(),
  round: t.text().notNull(),
  voter_type: t.text().notNull(),
  voting_group: t.text().notNull(),
  selection_method: t.text().notNull(),
  revoked: t.boolean().notNull(),
}));
