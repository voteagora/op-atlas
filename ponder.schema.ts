import { onchainTable } from "@ponder/core";

export const entity = onchainTable(
  "entity",
  (t) => ({
    id: t.text().primaryKey(),
    type: t.hex().notNull(),
    revoked: t.boolean().notNull(),
  }),
  () => ({
    schema: "ponder",
  })
);
