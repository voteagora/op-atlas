import * as dbSchema from "../ponder.schema";

export type Citizen = typeof dbSchema.citizen.$inferSelect;
export type Badgeholder = typeof dbSchema.badgeholder.$inferSelect;
export type GovContribution = typeof dbSchema.gov_contribution.$inferSelect;
export type RfVoter = typeof dbSchema.rf_voter.$inferSelect;

export type Attestation = {
  id: string;
  attester: string;
  entity: string;
  address: string;
  name: string;
  subtext: string;
};

export type AggregatedType = {
  badgeholder: { address: string; email?: string }[];
  citizen: { address: string; email?: string }[];
  gov_contribution: { address: string; email?: string }[];
  rf_voter: { address: string; email?: string }[];
  contributors: { address: string; email?: string }[];
  community_contributors: { address: string; email?: string }[];
  onchain_builders: { address: string; email?: string }[];
  github_repo_builders: { address: string; email?: string }[];
};

export type Entity = keyof typeof dbSchema;
