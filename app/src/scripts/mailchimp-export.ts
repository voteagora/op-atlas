import { default as BaseMailchimp } from "@mailchimp/mailchimp_marketing"

import { prisma } from "@/db/client"
import mailchimp from "@/lib/mailchimp"

const BATCH_SIZE = 500
type SUBSCRIBED_MEMBER = {
  subscriber_hash: string
  email_address: string
}

async function getLatestTranche(roundId: string) {
  const latestTranche = await prisma.recurringReward.findFirst({
    where: {
      roundId,
    },
    orderBy: {
      tranche: "desc",
    },
    select: {
      tranche: true,
    },
  })
  return latestTranche?.tranche || 0
}

async function exportEmailsToMailchimp() {
  const userEmails = await prisma.userEmail.findMany({
    where: {
      user: {
        projects: {
          some: {
            deletedAt: null,
            project: {
              deletedAt: null,
              applications: {
                some: {
                  createdAt: {
                    lte: new Date("2025-06-07"),
                  },
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      user: {
        select: {
          name: true,
          projects: {
            where: {
              deletedAt: null,
              project: {
                deletedAt: null,
              },
            },
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                  website: true,
                  recurringRewards: {
                    where: {
                      roundId: {
                        in: ["7", "8"],
                      },
                    },
                    select: {
                      roundId: true,
                      tranche: true,
                      amount: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const latestDevToolingTranche = await getLatestTranche("7")
  const latestOnchainBuildersTranche = await getLatestTranche("8")

  console.log("Latest tranches:", {
    devTooling: latestDevToolingTranche,
    onchainBuilders: latestOnchainBuildersTranche,
  })

  const batchMembers = userEmails
    .map((userEmail) => {
      const userFullName = userEmail.user.name
      const [FNAME, LNAME] = userFullName ? userFullName.split(" ") : ["", ""]

      const projects = userEmail.user.projects.map((p) => {
        return {
          ...p.project,
          totalReward: p.project.recurringRewards.reduce(
            (acc, curr) => BigInt(acc) + BigInt(curr.amount),
            BigInt(0),
          ),
        }
      })

      // Split projects into categories based on round IDs
      const devToolingProjects = projects.filter((p) =>
        p.recurringRewards.some((r) => r.roundId === "7"),
      )
      const onchainBuildersProjects = projects.filter((p) =>
        p.recurringRewards.some((r) => r.roundId === "8"),
      )

      // Split each category into rewarded and not rewarded
      const devToolingRewarded = devToolingProjects.filter((p) =>
        p.recurringRewards.some(
          (r) => r.roundId === "7" && r.tranche === latestDevToolingTranche,
        ),
      )
      const devToolingNotRewarded = devToolingProjects.filter(
        (p) =>
          !p.recurringRewards.some(
            (r) => r.roundId === "7" && r.tranche === latestDevToolingTranche,
          ),
      )

      const onchainBuildersRewarded = onchainBuildersProjects.filter((p) =>
        p.recurringRewards.some(
          (r) =>
            r.roundId === "8" && r.tranche === latestOnchainBuildersTranche,
        ),
      )
      const onchainBuildersNotRewarded = onchainBuildersProjects.filter(
        (p) =>
          !p.recurringRewards.some(
            (r) =>
              r.roundId === "8" && r.tranche === latestOnchainBuildersTranche,
          ),
      )

      // Format project names and links as HTML
      const formatProjectHtml = (project: { id: string; name: string }) => {
        return `<a href="https://atlas.optimism.io/project/${project.id}">${project.name}</a>`
      }

      const formatProjectLink = (project: { id: string }) => {
        return `https://atlas.optimism.io/project/${project.id}`
      }

      // Helper function to clean up project lists
      const cleanProjectList = (
        projects: {
          id: string
          name: string
          totalReward: bigint
        }[],
      ) => {
        if (!projects.length) return { names: "", links: "", topProject: "" }

        const names = projects
          .map((p) => p.name)
          .filter(Boolean)
          .join(", ")
        const links = projects
          .map((p) => formatProjectHtml(p))
          .filter(Boolean)
          .join(", ")
        const topProject = formatProjectLink(
          projects.sort((a, b) => {
            return Number(b.totalReward - a.totalReward)
          })[0],
        )

        return { names, links, topProject }
      }

      const devToolingRewardedData = cleanProjectList(devToolingRewarded)
      const devToolingNotRewardedData = cleanProjectList(devToolingNotRewarded)
      const onchainBuildersRewardedData = cleanProjectList(
        onchainBuildersRewarded,
      )
      const onchainBuildersNotRewardedData = cleanProjectList(
        onchainBuildersNotRewarded,
      )

      const tags = (() => {
        const tags = []
        if (devToolingRewardedData.names) {
          tags.push("Received rewards (dev tooling)")
        }
        if (onchainBuildersRewardedData.names) {
          tags.push("Received rewards (onchain builders)")
        } else if (
          !onchainBuildersRewardedData.names &&
          !devToolingRewardedData.names &&
          devToolingNotRewardedData.names
        ) {
          tags.push("Did not receive rewards (dev tooling)")
        } else if (
          !onchainBuildersRewardedData.names &&
          !devToolingRewardedData.names &&
          onchainBuildersNotRewardedData.names
        ) {
          tags.push("Did not receive rewards (onchain builders)")
        }
        return tags
      })()

      const data: BaseMailchimp.lists.BatchListMembersBodyMembersObject = {
        email_address: userEmail.email || "",
        email_type: "html",
        status: "subscribed",
        tags,
        merge_fields: {
          EMAIL: userEmail.email || "",
          FNAME: FNAME || "",
          LNAME: LNAME || "",
          PROJECTS: projects
            .map((p) => p.id)
            .filter(Boolean)
            .join(","),
          RFDR_N: devToolingRewardedData.names,
          RFDR_L: devToolingRewardedData.links,
          RFDNR_N: devToolingNotRewardedData.names,
          RFDNR_L: devToolingNotRewardedData.links,
          RFOR_N: onchainBuildersRewardedData.names,
          RFOR_L: onchainBuildersRewardedData.links,
          RFONR_N: onchainBuildersNotRewardedData.names,
          RFONR_L: onchainBuildersNotRewardedData.links,
          RFDR_TOP: devToolingRewardedData.topProject,
          RFOR_TOP: onchainBuildersRewardedData.topProject,
        },
      }

      // Only include in batch if there's actual project data
      if (
        devToolingRewardedData.names ||
        devToolingNotRewardedData.names ||
        onchainBuildersRewardedData.names ||
        onchainBuildersNotRewardedData.names
      ) {
        return data
      }
      return null
    })
    .filter(
      (
        member,
      ): member is BaseMailchimp.lists.BatchListMembersBodyMembersObject =>
        member !== null,
    )
    .filter(
      (member, index, self) =>
        index ===
        self.findIndex((t) => t.email_address === member.email_address),
    )

  console.log(
    `\nTotal users with metadata: ${
      batchMembers.filter(
        (m) =>
          m.merge_fields?.RFDR_N ||
          m.merge_fields?.RFDNR_N ||
          m.merge_fields?.RFOR_N ||
          m.merge_fields?.RFONR_N,
      ).length
    }`,
  )

  // Create JSON output of all metadata
  const metadataOutput = batchMembers
    .filter(
      (m) =>
        m.merge_fields?.RFDR_N ||
        m.merge_fields?.RFDNR_N ||
        m.merge_fields?.RFOR_N ||
        m.merge_fields?.RFONR_N,
    )
    .map((m) => {
      // Filter out any undefined merge_fields
      const mergeFields = m.merge_fields || {}

      // Helper function to clean up project lists
      const cleanProjectList = (
        names: string | undefined,
        links: string | undefined,
      ) => {
        if (!names && !links) return { names: "", links: "" }

        const nameList = (names || "").split(", ").filter(Boolean)
        const linkList = (links || "").split(", ").filter(Boolean)

        // If we have mismatched lengths, use the shorter one
        const length = Math.min(nameList.length, linkList.length)

        return {
          names: nameList.slice(0, length).join(", "),
          links: linkList.slice(0, length).join(", "),
        }
      }

      return {
        email: m.email_address || "",
        name: `${mergeFields.FNAME || ""} ${mergeFields.LNAME || ""}`.trim(),
        devToolingRewarded: cleanProjectList(
          mergeFields.RFDR_N,
          mergeFields.RFDR_L,
        ),
        devToolingNotRewarded: cleanProjectList(
          mergeFields.RFDNR_N,
          mergeFields.RFDNR_L,
        ),
        onchainBuildersRewarded: cleanProjectList(
          mergeFields.RFOR_N,
          mergeFields.RFOR_L,
        ),
        onchainBuildersNotRewarded: cleanProjectList(
          mergeFields.RFONR_N,
          mergeFields.RFONR_L,
        ),
      }
    })
    // Filter out any entries where all project lists are empty
    .filter(
      (entry) =>
        entry.devToolingRewarded.names ||
        entry.devToolingNotRewarded.names ||
        entry.onchainBuildersRewarded.names ||
        entry.onchainBuildersNotRewarded.names,
    )

  console.log(
    "\nMetadata JSON Output:",
    JSON.stringify(metadataOutput, null, 2),
  )

  // We should consider this being dynamic via DB
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID is not defined")
  }

  try {
    for (let i = 0; i < batchMembers.length; i += BATCH_SIZE) {
      const batch = batchMembers.slice(i, i + BATCH_SIZE)

      console.log("batch", batch)

      const res = await mailchimp.lists.batchListMembers(LIST_ID, {
        members: batch,
        update_existing: true,
      })

      const newMembers = (res as any).new_members
      newMembers.forEach((member: SUBSCRIBED_MEMBER) => {
        console.log(`Added ${member.email_address} to Mailchimp`)
      })
    }
  } catch (error) {
    console.error(error)
  }
}

exportEmailsToMailchimp()
