import { ponder } from "@/generated";
import { and, eq, graphql } from "@ponder/core";
import * as dbSchema from "../../ponder.schema";
import schemas from "../../schemas.config";
import { Attestation } from "../types";

ponder.use("/", graphql());

const entities = Object.keys(schemas) as (keyof typeof dbSchema)[];
type Entity = keyof typeof dbSchema;

entities.forEach((entity: Entity) => {
  ponder.get(`/${entity}/:address`, async (c) => {
    const address = c.req.param("address");
    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: and(eq(table.address, address), eq(table.revoked, false)),
    });

    if (data.length > 0) {
      return c.json({
        [entity]: data,
      });
    } else {
      return c.json(
        {
          error: `${entity} not found`,
        },
        404
      );
    }
  });
});

ponder.get("/attestations/:address", async (c) => {
  const address = c.req.param("address");
  const attestations: Attestation[] = [];

  for (const entity of entities) {
    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: and(eq(table.address, address), eq(table.revoked, false)),
    });

    if (data.length > 0) {
      data.forEach((item: any) => {
        attestations.push({
          id: item.id,
          entity: entity,
          address: item.address,
          subtext:
            item.selection_method ||
            item.rpgf_round ||
            item.gov_role ||
            item.voter_type ||
            "",
        });
      });
    }
  }

  return c.json(attestations);
});
