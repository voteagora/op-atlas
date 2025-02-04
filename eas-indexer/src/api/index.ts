import { ponder } from "@/generated";
import { and, eq, graphql, isNull } from "@ponder/core";
import * as dbSchema from "../../ponder.schema";
import schemas from "../../schemas.config";
import { Attestation, Entity, AggregatedType } from "../types";
import { parseEntity } from "./utils";
import { COMMUNITY_CONTRIBUTORS_ATTEST_ADDRESS } from "../constants";

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

// TODO: Pull all the entities in the same query and then separate into entity keys
ponder.get("/entities/aggregated", async (c) => {
  const entities: Entity[] = [
    "badgeholder",
    "citizen",
    "gov_contribution",
    "rf_voter",
  ];

  const aggregated: AggregatedType = {
    badgeholder: [],
    citizen: [],
    gov_contribution: [],
    rf_voter: [],
    contributors: [],
    community_contributors: [],
    github_repo_builders: [],
    onchain_builders: [],
  };

  for (const entity of entities) {
    const table = dbSchema[entity] as any;
    let data = [];
    if (entity === "rf_voter") {
      data = await (c.db.query[entity] as any).findMany({
        where: and(isNull(table.revoked_at), eq(table.voter_type, "rf_voter")),
      });
    } else if (entity === "gov_contribution") {
      data = await (c.db.query[entity] as any).findMany({
        where: and(isNull(table.revoked_at), eq(table.gov_season, "7")),
      });
    } else {
      data = await (c.db.query[entity] as any).findMany({
        where: isNull(table.revoked_at),
      });
    }

    if (data.length > 0) {
      aggregated[entity] = data.map((item: any) => ({ address: item.address }));

      aggregated.community_contributors = data.reduce((acc: any, item: any) => {
        if (item.attester === COMMUNITY_CONTRIBUTORS_ATTEST_ADDRESS) {
          acc.push({ address: item.address });
        }
        return acc;
      }, []);
    }
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
