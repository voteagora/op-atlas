import { ponder } from "@/generated";
import * as dbSchema from "../ponder.schema";
import { decodeAbiParameters, hexToBytes } from "viem";
import { schemaIds, schemaSignatures } from "./schemas";

ponder.on("EASAttested:Attested", async ({ event, context }) => {
  const { recipient, uid, schema } = event.args;

  const schemaName = schemaIds[schema];

  if (!schemaName) {
    throw new Error(`Unknown schema: ${schema}`);
  }

  const data = await context.client.readContract({
    abi: context.contracts.EASAttested.abi,
    address: context.contracts.EASAttested.address,
    functionName: "getAttestation",
    args: [uid],
  });

  const [farcasterId, selectionMethod] = decodeAbiParameters(
    schemaSignatures[schemaName],
    hexToBytes(data.data)
  );

  await context.db.insert(dbSchema.citizen).values({
    id: uid,
    address: recipient,
    farcaster_id: farcasterId.toString(),
    selection_method: selectionMethod,
    revoked: false,
  });
});

ponder.on("EASRevoked:Revoked", async ({ event, context }) => {
  const { uid } = event.args;
  await context.db.update(dbSchema.citizen, { id: uid }).set({ revoked: true });
});
