import * as dbSchema from "../ponder.schema";

export type Citizen = typeof dbSchema.citizen.$inferSelect;
export type Badgeholder = typeof dbSchema.badgeholder.$inferSelect;
export type GovContribution = typeof dbSchema.gov_contribution.$inferSelect;
export type RfVoter = typeof dbSchema.rf_voter.$inferSelect;
export type Votes = typeof dbSchema.votes.$inferSelect;

export type Attestation = {
  id: string;
  attester: string;
  entity: string;
  address: string;
  name: string;
  subtext: string;
  metadata: Record<string, any>;
};

export type AggregatedType = Record<keyof typeof dbSchema, Attestation[]>;

export type Entity = keyof typeof dbSchema;
