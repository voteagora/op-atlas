import { onchainTable } from "@ponder/core";

export const citizen = onchainTable(
  "citizen",
  (t) => ({
    id: t.text().primaryKey(),
    address: t.text().notNull(),
    farcaster_id: t.text().notNull(),
    selection_method: t.text().notNull(),
    revoked: t.boolean().notNull(),
  }),
  () => ({
    schema: "ponder",
  })
);
