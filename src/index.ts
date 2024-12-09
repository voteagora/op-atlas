import { ponder } from "@/generated";
import * as schema from "../ponder.schema";

ponder.on("EASAttested:Attested", async ({ event, context }) => {
  console.log(event.block.timestamp);

  await context.db.insert(schema.entity).values({
    id: event.args.uid,
    type: (
      await context.client.readContract({
        abi: context.contracts.EASAttested.abi,
        address: context.contracts.EASAttested.address,
        functionName: "getAttestation",
        args: [event.args.uid],
      })
    ).data,
    revoked: false,
  });
});

ponder.on("EASRevoked:Revoked", async ({ event, context }) => {
  await context.db
    .update(schema.entity, { id: event.args.uid })
    .set({ revoked: true });
});
