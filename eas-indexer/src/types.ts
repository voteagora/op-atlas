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
  badgeholder: { address: string }[];
  citizen: { address: string }[];
  gov_contribution: { address: string }[];
  rf_voter: { address: string }[];
};

export type Entity = keyof typeof dbSchema;
