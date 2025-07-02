import { ponder } from "ponder:registry";
import * as dbSchema from "../ponder.schema";
import { decodeAbiParameters, hexToBytes } from "viem";
import { schemaIds, schemaSignatures } from "./schemas";
import schemas from "../schemas.config";

ponder.on("EASAttested:Attested", async ({ event, context }) => {
  const { attester, recipient, uid, schema } = event.args;
  const createdAt = event.block.timestamp;

  const schemaName = schemaIds[schema];

  if (!schemaName) {
    throw new Error(`Unknown schema: ${schema}`);
  }

  // If the attester is not the expected attester, skip the event
  if (
    schemas[schemaName]?.attester &&
    !schemas[schemaName].attester.includes(attester)
  ) {
    return;
  }

  const data = await context.client.readContract({
    abi: context.contracts.EASAttested.abi,
    address: context.contracts.EASAttested.address,
    functionName: "getAttestation",
    args: [uid],
  });

  switch (schemaName) {
    case "citizen":
      {
        const [farcasterId, selectionMethod] = decodeAbiParameters(
          schemaSignatures[schemaName],
          hexToBytes(data.data)
        );
        await context.db.insert(dbSchema.citizen).values({
          id: uid,
          address: recipient.toLowerCase(),
          farcaster_id: farcasterId.toString(),
          selection_method: selectionMethod,
          attester: attester.toLowerCase(),
          created_at: createdAt,
        });
      }
      break;

    case "badgeholder":
      {
        const [rpgfRound, referredBy, referredMethod] = decodeAbiParameters(
          schemaSignatures[schemaName],
          hexToBytes(data.data)
        );
        await context.db.insert(dbSchema.badgeholder).values({
          id: uid,
          address: recipient.toLowerCase(),
          rpgf_round: rpgfRound,
          referred_by: referredBy.toLowerCase(),
          referred_method: referredMethod,
          attester: attester.toLowerCase(),
          created_at: createdAt,
        });
      }
      break;

    case "gov_contribution":
      {
        const [govSeason, govRole] = decodeAbiParameters(
          schemaSignatures[schemaName],
          hexToBytes(data.data)
        );
        await context.db.insert(dbSchema.gov_contribution).values({
          id: uid,
          address: recipient.toLowerCase(),
          gov_season: govSeason,
          gov_role: govRole,
          attester: attester.toLowerCase(),
          created_at: createdAt,
        });
      }
      break;

    case "rf_voter":
      {
        const [farcasterId, round, voterType, votingGroup, selectionMethod] =
          decodeAbiParameters(
            schemaSignatures[schemaName],
            hexToBytes(data.data)
          );
        await context.db.insert(dbSchema.rf_voter).values({
          id: uid,
          address: recipient.toLowerCase(),
          farcaster_id: farcasterId.toString(),
          round,
          voter_type: voterType,
          voting_group: votingGroup,
          selection_method: selectionMethod,
          attester: attester.toLowerCase(),
          created_at: createdAt,
        });
      }
      break;

    case "votes": {
      const [proposalId, params] = decodeAbiParameters(
        schemaSignatures[schemaName],
        hexToBytes(data.data)
      );
      await context.db.insert(dbSchema.votes).values({
        id: uid,
        address: recipient.toLowerCase(),
        proposal_id: proposalId.toString(),
        params,
        voterId: data.refUID,
        attester: attester.toLowerCase(),
        created_at: createdAt,
      });
    }
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
      .set({ revoked_at: event.block.timestamp });
  } catch (e) {
    if (!(e as Error).message.includes("No existing record found")) {
      throw e;
    }
  }
});
