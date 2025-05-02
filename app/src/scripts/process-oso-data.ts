import { resolve } from "path"
import { readFileSync } from "fs"
import { prisma } from "@/db/client"
import { ProjectOSOMetric } from "@prisma/client"
import { formatUnits, parseUnits } from "viem"

enum Mission {
  ONCHAIN_BUILDER = "onchain_builder",
  DEV_TOOLING = "dev_tooling",
}

interface OnchainBuilderProject {
  oso_project_id?: string
  op_atlas_id?: string
  display_name?: string
  round_id?: string
  is_eligible?: boolean
  op_reward?: number
  has_defillama_adapter?: boolean
  has_bundle_bear?: boolean
  eligibility_metrics?: {
    active_days?: number
    gas_fees?: number
    transaction_count?: number
    active_addresses_count?: number
  }
  monthly_metrics?: {
    contract_invocations?: number
    defillama_tvl?: number | null
    active_addresses_aggregation?: number
    gas_fees?: number
  }
}

interface DevToolingProject {
  oso_project_id?: string
  op_atlas_id?: string
  display_name?: string
  round_id?: string
  is_eligible?: boolean
  op_reward?: number
  star_count?: number
  fork_count?: number
  num_packages_in_deps_dev?: number
  package_connection_count?: number
  developer_connection_count?: number
  onchain_builder_oso_project_ids?: string[]
  onchain_builder_op_atlas_ids?: string[]
  trusted_developer_usernames?: string[]
  downstream_gas?: number
}

interface ProcessOsoDataArgs {
  files: string[]
  month: number
  mission: Mission
  reset?: boolean
}

interface ParsedArgs {
  [key: string]: string
}

// ANSI color codes
const RED = "\x1b[31m"
const RESET = "\x1b[0m"

const parseArgs = (args: string[]): ParsedArgs => {
  const parsed: ParsedArgs = {}

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [flag, value] = arg.slice(2).split("=")
      parsed[flag] = value || ""
    }
  }

  return parsed
}

const showHelp = () => {
  console.log(
    "Usage: pnpm process:oso-data --files=<paths> --month=<number> --mission=<type> [--reset]",
  )
  console.log(
    "Example: pnpm process:oso-data --files=path1.json,path2.json --month=3 --mission=onchain_builder --reset",
  )
  console.log("\nOptions:")
  console.log(
    "  --files    Comma-separated list of file paths (relative or absolute)",
  )
  console.log("  --month    Month number (1 or 2)")
  console.log("  --mission  Mission type (onchain_builder or dev_tooling)")
  console.log(
    "  --reset    Optional flag to clear existing data before processing",
  )
  process.exit(0)
}

const resolvePaths = (paths: string[]): string[] => {
  return paths.map((path) => resolve(process.cwd(), path))
}

const readJsonFile = <T>(filePath: string): T[] => {
  try {
    const fileContent = readFileSync(filePath, "utf8")
    const data = JSON.parse(fileContent)

    if (!Array.isArray(data)) {
      throw new Error("File does not contain an array")
    }

    return data as T[]
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `${RED}Error reading file ${filePath}: ${error.message}${RESET}`,
      )
    } else {
      console.error(`${RED}Unknown error reading file ${filePath}${RESET}`)
    }
    process.exit(1)
  }
}

const processOnchainBuilderData = async (
  data: OnchainBuilderProject[],
  month: number,
) => {
  console.log("\nProcessing Onchain Builder data:")
  console.log(`Found ${data.length} projects`)

  if (data.length === 0) {
    console.error(`${RED}No data found in file${RESET}`)
    process.exit(1)
  }

  for (const project of data) {
    if (!project.op_atlas_id) {
      console.error(`${RED}Project missing op_atlas_id${RESET}`)
      continue
    }

    const projectId = project.op_atlas_id

    // Create RecurringReward entry if op_reward exists
    if (project.op_reward) {
      try {
        await prisma.recurringReward.upsert({
          where: {
            roundId_tranche_projectId: {
              roundId: "8", // Onchain builder round
              tranche: month,
              projectId,
            },
          },
          update: {
            amount: parseUnits(project.op_reward.toString(), 18).toString(),
          },
          create: {
            roundId: "8", // Onchain builder round
            tranche: month,
            projectId,
            amount: parseUnits(project.op_reward.toString(), 18).toString(),
          },
        })
        console.log(
          `Processed recurring reward for project ${
            project.display_name || "unknown"
          } (${projectId}): ${project.op_reward} OP`,
        )
      } catch (error) {
        console.error(
          `${RED}Error creating recurring reward for project ${
            project.display_name || "unknown"
          } (${projectId}): ${error}${RESET}`,
        )
      }
    }

    const metrics = [
      {
        key: "is_eligible",
        metric: ProjectOSOMetric.IS_ONCHAIN_BUILDER_ELIGIBLE,
        value: project.is_eligible?.toString() || "",
      },
      {
        key: "transaction_count",
        metric: ProjectOSOMetric.TRANSACTION_COUNT,
        value: project.monthly_metrics?.contract_invocations?.toString() || "",
      },
      {
        key: "active_addresses_count",
        metric: ProjectOSOMetric.ACTIVE_ADDRESSES_COUNT,
        value:
          project.monthly_metrics?.active_addresses_aggregation?.toString() ||
          "",
      },
      {
        key: "gas_fees",
        metric: ProjectOSOMetric.GAS_FEES,
        value: project.monthly_metrics?.gas_fees?.toString() || "",
      },
      {
        key: "defillama_tvl",
        metric: ProjectOSOMetric.TVL,
        value: project.monthly_metrics?.defillama_tvl?.toString() || "",
      },
      {
        key: "has_defillama_adapter",
        metric: ProjectOSOMetric.HAS_DEFILLAMA_ADAPTER,
        value: project.has_defillama_adapter?.toString() || "",
      },
      {
        key: "has_bundle_bear",
        metric: ProjectOSOMetric.HAS_BUNDLE_BEAR,
        value: project.has_bundle_bear?.toString() || "",
      },
    ]

    for (const { metric, value } of metrics) {
      try {
        await prisma.projectOSOMetrics.upsert({
          where: {
            projectId_metric_tranche: {
              projectId,
              metric,
              tranche: month,
            },
          },
          update: {
            value,
          },
          create: {
            projectId,
            metric,
            value,
            tranche: month,
          },
        })
      } catch (error) {
        console.error(
          `${RED}Error processing metric ${metric} for project ${
            project.display_name || "unknown"
          } (${projectId}): ${error}${RESET}`,
        )
      }
    }
    console.log(
      `Processed metrics for project ${
        project.display_name || "unknown"
      } (${projectId})`,
    )
  }
}

const processDevToolingData = async (
  data: DevToolingProject[],
  month: number,
) => {
  console.log("\nProcessing Dev Tooling data:")
  console.log(`Found ${data.length} projects`)

  if (data.length === 0) {
    console.error(`${RED}No data found in file${RESET}`)
    process.exit(1)
  }

  for (const project of data) {
    if (!project.op_atlas_id) {
      console.error(`${RED}Project missing op_atlas_id${RESET}`)
      continue
    }

    const projectId = project.op_atlas_id
    console.log(
      `\nProcessing project: ${
        project.display_name || "unknown"
      } (${projectId})`,
    )

    // Create RecurringReward entry if op_reward exists
    if (project.op_reward) {
      try {
        await prisma.recurringReward.upsert({
          where: {
            roundId_tranche_projectId: {
              roundId: "7", // Dev tooling round
              tranche: month,
              projectId,
            },
          },
          update: {
            amount: parseUnits(project.op_reward.toString(), 18).toString(),
          },
          create: {
            roundId: "7", // Dev tooling round
            tranche: month,
            projectId,
            amount: parseUnits(project.op_reward.toString(), 18).toString(),
          },
        })
        console.log(
          `Processed recurring reward for project ${
            project.display_name || "unknown"
          } (${projectId}): ${project.op_reward} OP`,
        )
      } catch (error) {
        console.error(
          `${RED}Error creating recurring reward for project ${
            project.display_name || "unknown"
          } (${projectId}): ${error}${RESET}`,
        )
      }
    }

    // Process metrics in batches
    const metrics = [
      {
        key: "is_eligible",
        metric: ProjectOSOMetric.IS_DEV_TOOLING_ELIGIBLE,
        value: project.is_eligible?.toString() || "",
      },
      {
        key: "star_count",
        metric: ProjectOSOMetric.STAR_COUNT,
        value: project.star_count?.toString() || "",
      },
      {
        key: "fork_count",
        metric: ProjectOSOMetric.FORK_COUNT,
        value: project.fork_count?.toString() || "",
      },
      {
        key: "num_packages_in_deps_dev",
        metric: ProjectOSOMetric.NUM_PACKAGES_IN_DEPS_DEV,
        value: project.num_packages_in_deps_dev?.toString() || "",
      },
      {
        key: "package_connection_count",
        metric: ProjectOSOMetric.PACKAGE_CONNECTION_COUNT,
        value: project.package_connection_count?.toString() || "",
      },
      {
        key: "developer_connection_count",
        metric: ProjectOSOMetric.DEVELOPER_CONNECTION_COUNT,
        value: project.developer_connection_count?.toString() || "",
      },
      {
        key: "downstream_gas",
        metric: ProjectOSOMetric.DOWNSTREAM_GAS,
        value: project.downstream_gas?.toString() || "",
      },
    ]

    // Batch process regular metrics
    const metricPromises = metrics.map(({ metric, value }) =>
      prisma.projectOSOMetrics.upsert({
        where: {
          projectId_metric_tranche: {
            projectId,
            metric,
            tranche: month,
          },
        },
        update: {
          value,
        },
        create: {
          projectId,
          metric,
          value,
          tranche: month,
        },
      }),
    )

    // Batch process trusted developer usernames
    const trustedDevPromises = (project.trusted_developer_usernames || []).map(
      (username) =>
        prisma.projectOSOMetrics.upsert({
          where: {
            projectId_metric_tranche: {
              projectId,
              metric: ProjectOSOMetric.TRUSTED_DEVELOPER_USERNAME,
              tranche: month,
            },
          },
          update: {
            value: username,
          },
          create: {
            projectId,
            metric: ProjectOSOMetric.TRUSTED_DEVELOPER_USERNAME,
            value: username,
            tranche: month,
          },
        }),
    )

    try {
      // Execute all metric operations in parallel
      await Promise.all([...metricPromises, ...trustedDevPromises])
    } catch (error) {
      console.error(
        `${RED}Error processing metrics for project ${
          project.display_name || "unknown"
        } (${projectId}): ${error}${RESET}`,
      )
    }

    // Process related projects in batches
    const relatedProjectIds =
      month === 1
        ? (project as any).onchain_builder_project_names || [] // Handle month 1 edge case
        : project.onchain_builder_op_atlas_ids || []

    if (relatedProjectIds.length) {
      console.log(
        `Found ${relatedProjectIds.length} related projects:`,
        relatedProjectIds,
      )
      try {
        // First delete any existing related projects for this project and tranche
        await prisma.projectOSOAtlasRelatedProjects.deleteMany({
          where: {
            projectId,
            tranche: month,
          },
        })

        // Then create new entries
        await Promise.all(
          relatedProjectIds.map((relatedProjectId: string) =>
            prisma.projectOSOAtlasRelatedProjects.create({
              data: {
                projectId,
                tranche: month,
                relatedProjectId,
              },
            }),
          ),
        )

        console.log(
          `Successfully processed ${relatedProjectIds.length} related projects`,
        )
      } catch (error) {
        console.error(
          `${RED}Error processing related projects for project ${
            project.display_name || "unknown"
          } (${projectId}): ${error}${RESET}`,
        )
      }
    } else {
      console.log("No related projects found")
    }

    console.log(
      `Processed metrics and relations for project ${
        project.display_name || "unknown"
      } (${projectId})`,
    )
  }
}

const processOsoData = async ({
  files,
  month,
  mission,
  reset = false,
}: ProcessOsoDataArgs) => {
  console.log("Processing OSO data with:", {
    files,
    month,
    mission,
    reset,
  })

  if (reset) {
    console.log("Clearing existing data...")
    // Use a transaction to ensure all deletes succeed or none do
    await prisma.$transaction(async (tx) => {
      // First delete all related projects
      await tx.projectOSOAtlasRelatedProjects.deleteMany({
        where: { tranche: month },
      })
      await tx.projectOSORelatedProjects.deleteMany({
        where: { tranche: month },
      })
      // Then delete all metrics
      await tx.projectOSOMetrics.deleteMany({
        where: { tranche: month },
      })
      // Finally delete all recurring rewards
      await tx.recurringReward.deleteMany({
        where: { tranche: month },
      })
    })
    console.log("Existing data cleared")
  }

  // Read and process the first file
  const firstFile = files[0]
  const data = readJsonFile<DevToolingProject>(firstFile)
  console.log(`Found ${data.length} projects in file`)

  if (mission === Mission.ONCHAIN_BUILDER) {
    await processOnchainBuilderData(data, month)
  } else {
    await processDevToolingData(data, month)
  }

  // After processing the data, update funding rewards with the sum of recurring rewards
  console.log("\n🔄 Updating funding rewards with recurring rewards...")

  const roundId = mission === Mission.ONCHAIN_BUILDER ? "8" : "7" // Onchain builder or Dev tooling round

  // Get all recurring rewards for the current round
  const recurringRewards = await prisma.recurringReward.findMany({
    where: {
      roundId,
      deletedAt: null, // Only active rewards
    },
    select: {
      projectId: true,
      amount: true,
    },
  })

  const recurringRewardByProject = recurringRewards.reduce((acc, reward) => {
    acc[reward.projectId] =
      (acc[reward.projectId] ?? BigInt(0)) + BigInt(reward.amount)
    return acc
  }, {} as Record<string, bigint>)

  for (const [projectId, totalAmount] of Object.entries(
    recurringRewardByProject,
  )) {
    await prisma.fundingReward.upsert({
      where: {
        roundId_projectId: {
          roundId,
          projectId,
        },
      },
      update: {
        amount: Number(formatUnits(totalAmount, 16)) / 100,
      },
      create: {
        id: crypto.randomUUID(),
        roundId,
        projectId,
        amount: Number(formatUnits(totalAmount, 16)) / 100,
      },
    })

    console.log(
      `Created new funding reward for project ${projectId} in round ${roundId}`,
    )
  }

  console.log("✅ Funding rewards updated with recurring rewards")
}

// Parse command line arguments
const args = process.argv.slice(2)
if (args.includes("--help") || args.includes("-h")) {
  showHelp()
}

const parsedArgs = parseArgs(args)

// Validate required arguments
const requiredArgs = ["files", "month", "mission"]
const missingArgs = requiredArgs.filter((arg) => !parsedArgs[arg])

if (missingArgs.length > 0) {
  console.error(
    `${RED}Missing required arguments: ${missingArgs.join(", ")}${RESET}`,
  )
  showHelp()
}

// Parse and validate inputs
const files = resolvePaths(parsedArgs.files.split(","))
const month = parseInt(parsedArgs.month, 10)
const mission = parsedArgs.mission as Mission
const reset = parsedArgs.reset === "true"

if (isNaN(month) || month < 1 || month > 2) {
  console.error(`${RED}Month must be either 1 or 2${RESET}`)
  process.exit(1)
}

if (!Object.values(Mission).includes(mission)) {
  console.error(
    `${RED}Mission must be either "onchain_builder" or "dev_tooling"${RESET}`,
  )
  process.exit(1)
}

// Execute the main function
processOsoData({ files, month, mission, reset }).catch(console.error)
