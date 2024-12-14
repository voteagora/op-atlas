import * as dbSchema from "../ponder.schema";

export type Citizen = typeof dbSchema.citizen.$inferSelect;
export type Badgeholder = typeof dbSchema.badgeholder.$inferSelect;
export type GovContribution = typeof dbSchema.gov_contribution.$inferSelect;
export type RfVoter = typeof dbSchema.rf_voter.$inferSelect;
