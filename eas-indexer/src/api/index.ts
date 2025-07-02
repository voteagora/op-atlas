import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import * as dbSchema from "../../ponder.schema";
import { and, eq, graphql, isNull } from "ponder";
import { Attestation, Entity, AggregatedType } from "../types";
import { parseEntity } from "./utils";
import schemas from "../../schemas.config";

const app = new Hono();

app.use("/graphql", graphql({ db, schema }));

const entities = Object.keys(schemas) as (keyof typeof dbSchema)[];

entities.forEach((entity: Entity) => {
  app.get(`/${entity}/:address`, async (c) => {
    const address = c.req.param("address").toLowerCase();
    const table = dbSchema[entity];
    const data = await db
      .select()
      .from(schema[entity])
      .where(and(eq(table.address, address), isNull(table.revoked_at)));

    if (data.length > 0) {
      return c.json({
        [entity]: data.map((d) => {
          return {
            ...d,
            created_at: new Date(Number(d.created_at) * 1000).toISOString(),
            revoked_at: d.revoked_at
              ? new Date(Number(d.revoked_at) * 1000).toISOString()
              : null,
          };
        }),
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
  app.get(`/${entity}`, async (c) => {
    const table = dbSchema[entity];
    const data = await db
      .select()
      .from(schema[entity])
      .where(isNull(table.revoked_at));

    if (data.length > 0) {
      return c.json({
        [entity]: data.map((d) => {
          return {
            ...d,
            created_at: new Date(Number(d.created_at) * 1000).toISOString(),
            revoked_at: d.revoked_at
              ? new Date(Number(d.revoked_at) * 1000).toISOString()
              : null,
          };
        }),
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

app.get("/entities/aggregated", async (c) => {
  const aggregated: AggregatedType = entities.reduce((acc, entity) => {
    (acc as Record<Entity, Attestation[]>)[entity] = [];
    return acc;
  }, {} as AggregatedType);

  for (const entity of entities) {
    const attestations: Attestation[] = [];

    const table = dbSchema[entity];
    const data = await db
      .select()
      .from(schema[entity])
      .where(isNull(table.revoked_at));

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

app.get("/attestations/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();
  const attestations: Attestation[] = [];

  for (const entity of entities) {
    const table = dbSchema[entity];
    const data = await db
      .select()
      .from(schema[entity])
      .where(and(eq(table.address, address), isNull(table.revoked_at)));

    if (data.length > 0) {
      data.forEach((item: any) => {
        const parsed = parseEntity(item, entity);
        attestations.push(parsed);
      });
    }
  }

  return c.json(attestations);
});

export default app;
