import { ponder } from "@/generated";
import { and, eq, graphql, isNull } from "@ponder/core";
import * as dbSchema from "../../ponder.schema";
import schemas from "../../schemas.config";
import { Attestation, Entity, AggregatedType } from "../types";
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

entities.forEach((entity: Entity) => {
  ponder.get(`/${entity}`, async (c) => {
    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: isNull(table.revoked_at),
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
  const aggregated: AggregatedType = entities.reduce((acc, entity) => {
    (acc as Record<Entity, Attestation[]>)[entity] = [];
    return acc;
  }, {} as AggregatedType);

  for (const entity of entities) {
    const attestations: Attestation[] = [];

    const table = dbSchema[entity];
    const data = await (c.db.query[entity] as any).findMany({
      where: isNull(table.revoked_at),
    });

    if (data.length > 0) {
      data.forEach((item: any) => {
        const parsed = parseEntity(item, entity);
        attestations.push(parsed);
      });
    }

    aggregated[entity] = attestations;
  }

  return c.json(aggregated);
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
