"use server"

import {
  getAllBadgeholders,
  getAllCitizens,
  getAllCommunityContributors,
  getAllContributors,
  getAllGithubRepoBuiulders,
  getAllGovContributors,
  getAllOnchainBuilders,
  getAllRFVoters,
} from "@/db/users"

import { ExtendedAggregatedType } from "../types"

export async function getAggregatedRecords(records: ExtendedAggregatedType) {
  const [
    citizen,
    badgeholder,
    gov_contribution,
    rf_voter,
    contributors,
    onchain_builders,
    github_repo_builders,
    community_contributors,
  ] = await Promise.all([
    getAllCitizens(records.citizen),
    getAllBadgeholders(),
    getAllGovContributors(records.gov_contribution),
    getAllRFVoters(records.rf_voter),
    getAllContributors(records.contributors),
    getAllOnchainBuilders(),
    getAllGithubRepoBuiulders(),
    getAllCommunityContributors(
      records.community_contributors.map((c) => c.address),
    ),
  ])

  const result = {
    citizen: citizen?.map((c) => ({
      address: c.address,
      email: c.user.emails.at(-1)?.email ?? "",
    })),
    badgeholder,
    gov_contribution: gov_contribution?.map((gc) => ({
      address: gc.address,
      email: gc.user.emails.at(-1)?.email ?? "",
    })),
    rf_voter: rf_voter?.map((rv) => ({
      address: rv.address,
      email: rv.user.emails.at(-1)?.email ?? "",
    })),
    contributors:
      contributors?.map((c) => ({
        address: c?.addresses.at(-1)?.address ?? "",
        email: c?.emails.at(-1)?.email ?? "",
      })) ?? [],
    onchain_builders:
      onchain_builders?.map((ob) => ({
        address: ob.addresses.at(-1)?.address ?? "",
        email: ob.emails.at(-1)?.email ?? "",
      })) ?? [],
    github_repo_builders:
      github_repo_builders?.map((grb) => ({
        address: grb.addresses.at(-1)?.address ?? "",
        email: grb.emails.at(-1)?.email ?? "",
      })) ?? [],
    community_contributors: community_contributors?.map((cc) => ({
      address: cc.address,
      email: cc.user.emails.at(-1)?.email ?? "",
    })),
  }

  return result
}
