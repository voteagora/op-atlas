import { ponder } from "@/generated";
import { and, eq, graphql, isNull } from "@ponder/core";
import * as dbSchema from "../../ponder.schema";
import schemas from "../../schemas.config";
import { Attestation, Entity } from "../types";
import { parseEntity } from "./utils";

ponder.use("/", graphql());

const entities = Object.keys(schemas) as (keyof typeof dbSchema)[];

entities.forEach((entity: Entity) => {
  ponder.get(`/${entity}/:address`, async (c) => {
    const address = c.req.param("address").toLowerCase();
    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: and(eq(table.address, address), isNull(table.revoked_at)),
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

ponder.get("/entities/aggregated", async (c) => {
  const entities: Entity[] = [
    "badgeholder",
    "citizen",
    "gov_contribution",
    "rf_voter",
  ];

  const aggregated: Record<Entity, string[]> = {
    badgeholder: [],
    citizen: [],
    gov_contribution: [],
    rf_voter: [],
  };

  for (const entity of entities) {
    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: isNull(table.revoked_at),
    });

    if (data.length > 0) {
      aggregated[entity] = data.map((item: any) => item.address);
    }
  }

  return c.json(aggregated);
});

ponder.get("/entities/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();

  const entities: Entity[] = [
    "badgeholder",
    "citizen",
    "gov_contribution",
    "rf_voter",
  ];

  const addressEntities: Entity[] = [];

  entities.forEach(async (entity) => {
    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: and(eq(table.address, address), isNull(table.revoked_at)),
    });

    if (data.length === 0) {
      return;
    }

    addressEntities.push(entity);
  });

  if (addressEntities.length > 0) {
    return c.json({ [address]: addressEntities });
  }

  return c.json(`No entity found for address ${address}`, 404);
});

ponder.get("/attestations/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();
  const attestations: Attestation[] = [];

  for (const entity of entities) {
    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: and(eq(table.address, address), isNull(table.revoked_at)),
    });

    if (data.length > 0) {
      data.forEach((item: any) => {
        const parsed = parseEntity(item, entity);
        attestations.push(parsed);
      });
    }
  }

  return c.json(attestations);
});
