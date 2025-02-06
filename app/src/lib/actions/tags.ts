"use server"

import { AggregatedType } from "eas-indexer/src/types"

import {
  getAllCitizens,
  getAllContributors,
  getAllGithubRepoBuiulders,
  getAllOnchainBuilders,
  getAllRFVoters,
  getAllS7GovContributors,
} from "@/db/users"

export async function getAggregatedRecords(records: AggregatedType) {
  const [
    citizen,
    gov_contribution,
    rf_voter,
    contributors,
    onchain_builders,
    github_repo_builders,
  ] = await Promise.all([
    getAllCitizens(records.citizen),
    getAllS7GovContributors(records.gov_contribution),
    getAllRFVoters(records.rf_voter),
    getAllContributors(),
    getAllOnchainBuilders(),
    getAllGithubRepoBuiulders(),
  ])

  const result = {
    citizen: citizen?.map((c) => ({
      address: c.address,
      email: c.user.emails.at(-1)?.email ?? "",
    })),
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
  }

  return result
}
