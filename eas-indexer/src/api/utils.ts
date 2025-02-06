import { Entity, GovContribution, RfVoter } from "../types";

import { Citizen } from "../types";

import { Attestation } from "../types";

import { Badgeholder } from "../types";

const entityConfigs = {
  gov_contribution: {
    getName: (item: GovContribution) => item.gov_role,
    getSubtext: (item: GovContribution) => `Season ${item.gov_season}`,
    getMetadata: (item: GovContribution) => ({
      role: item.gov_role,
      season: item.gov_season,
    }),
  },
  rf_voter: {
    getName: () => "Retro Funding Voter",
    getSubtext: (item: RfVoter) =>
      `Voter Type: ${item.voter_type}; Round ${item.round}`,
    getMetadata: (item: RfVoter) => ({
      voterType: item.voter_type,
      round: item.round,
    }),
  },
  citizen: {
    getName: () => "Citizen",
    getSubtext: (item: Citizen) =>
      `Since ${new Date(Number(item.created_at) * 1000).toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        }
      )}`,
    getMetadata: (item: Citizen) => ({}),
  },
  badgeholder: {
    getName: () => "Retro Funding Voter",
    getSubtext: (item: Badgeholder) => `Round ${item.rpgf_round}`,
    getMetadata: (item: Badgeholder) => ({}),
  },
} as const;

export function parseEntity<T extends Entity>(
  item: any,
  entity: T
): Attestation {
  const config = entityConfigs[entity];

  return {
    id: item.id,
    attester: item.attester,
    entity,
    address: item.address,
    name: config.getName(item),
    subtext: config.getSubtext(item),
    metadata: config.getMetadata(item),
  };
}
