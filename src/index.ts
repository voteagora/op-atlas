import { ponder } from "@/generated";
import * as dbSchema from "../ponder.schema";
import { decodeAbiParameters, hexToBytes } from "viem";
import { schemaIds, schemaSignatures } from "./schemas";

ponder.on("EASAttested:Attested", async ({ event, context }) => {
  const { attester, recipient, uid, schema } = event.args;

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

  switch (schemaName) {
    case "citizen":
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
      break;
    case "badgeholder":
      if (attester !== "0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9") {
        break;
      }

      const [rpgfRound, referredBy, referredMethod] = decodeAbiParameters(
        schemaSignatures[schemaName],
        hexToBytes(data.data)
      );
      await context.db.insert(dbSchema.badgeholder).values({
        id: uid,
        address: recipient,
        rpgf_round: rpgfRound,
        referred_by: referredBy,
        referred_method: referredMethod,
        revoked: false,
      });
      break;
  }
});

ponder.on("EASRevoked:Revoked", async ({ event, context }) => {
  const { uid, schema } = event.args;

  const schemaName = schemaIds[schema];

  if (!schemaName) {
    throw new Error(`Unknown schema: ${schema}`);
  }

  try {
    await context.db
      .update(dbSchema[schemaName], { id: uid })
      .set({ revoked: true });
  } catch (e) {
    if (!(e as Error).message.includes("No existing record found")) {
      throw e;
    }
  }
});
