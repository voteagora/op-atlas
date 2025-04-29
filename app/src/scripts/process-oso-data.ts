import { resolve } from "path"
import { readFileSync } from "fs"
import { prisma } from "@/db/client"
import { ProjectOSOMetric } from "@prisma/client"

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
  transaction_count?: number
  active_days?: number
  active_addresses_count?: number
  gas_fees?: number
  has_defillama_adapter?: boolean
  has_bundle_bear?: boolean
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
  onchain_builder_op_atlas_names?: string[]
}

interface ProcessOsoDataArgs {
  files: string[]
  month: number
  mission: Mission
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
    "Usage: pnpm process:oso-data --files=<paths> --month=<number> --mission=<type>",
  )
  console.log(
    "Example: pnpm process:oso-data --files=path1.json,path2.json --month=3 --mission=onchain_builder",
  )
  console.log("\nOptions:")
  console.log(
    "  --files    Comma-separated list of file paths (relative or absolute)",
  )
  console.log("  --month    Month number (1 or 2)")
  console.log("  --mission  Mission type (onchain_builder or dev_tooling)")
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

    const metrics = [
      {
        key: "is_eligible",
        metric: ProjectOSOMetric.IS_ONCHAIN_BUILDER_ELIGIBLE,
      },
      { key: "transaction_count", metric: ProjectOSOMetric.TRANSACTION_COUNT },
      {
        key: "active_addresses_count",
        metric: ProjectOSOMetric.ACTIVE_ADDRESSES_COUNT,
      },
      { key: "gas_fees", metric: ProjectOSOMetric.GAS_FEES },
      {
        key: "has_defillama_adapter",
        metric: ProjectOSOMetric.HAS_DEFILLAMA_ADAPTER,
      },
      { key: "has_bundle_bear", metric: ProjectOSOMetric.HAS_BUNDLE_BEAR },
    ]

    const data = metrics.map(({ key, metric }) => ({
      projectId,
      metric,
      value: project[key as keyof OnchainBuilderProject]?.toString() || "",
      tranche: month,
    }))

    try {
      await prisma.projectOSOMetrics.createMany({
        data,
        skipDuplicates: true,
      })
      console.log(
        `Processed metrics for project ${
          project.display_name || "unknown"
        } (${projectId})`,
      )
    } catch (error) {
      console.error(
        `${RED}Error processing metrics for project ${
          project.display_name || "unknown"
        } (${projectId}): ${error}${RESET}`,
      )
    }
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

    // Process metrics
    const metrics = [
      { key: "is_eligible", metric: ProjectOSOMetric.IS_DEV_TOOLING_ELIGIBLE },
      { key: "star_count", metric: ProjectOSOMetric.STAR_COUNT },
      { key: "fork_count", metric: ProjectOSOMetric.FORK_COUNT },
      {
        key: "num_packages_in_deps_dev",
        metric: ProjectOSOMetric.NUM_PACKAGES_IN_DEPS_DEV,
      },
      {
        key: "package_connection_count",
        metric: ProjectOSOMetric.PACKAGE_CONNECTION_COUNT,
      },
      {
        key: "developer_connection_count",
        metric: ProjectOSOMetric.DEVELOPER_CONNECTION_COUNT,
      },
    ]

    const metricData = metrics.map(({ key, metric }) => ({
      projectId,
      metric,
      value: project[key as keyof DevToolingProject]?.toString() || "",
      tranche: month,
    }))

    // Add trusted developer usernames as metrics
    const trustedDevMetrics =
      project.trusted_developer_usernames?.map((username) => ({
        projectId,
        metric: ProjectOSOMetric.TRUSTED_DEVELOPER_USERNAME,
        value: username,
        tranche: month,
      })) || []

    try {
      // Create metrics
      await prisma.projectOSOMetrics.createMany({
        data: [...metricData, ...trustedDevMetrics],
        skipDuplicates: true,
      })

      // Create related projects
      if (project.onchain_builder_oso_project_ids?.length) {
        await prisma.projectOSORelatedProjects.createMany({
          data: project.onchain_builder_oso_project_ids.map((osoId) => ({
            projectId,
            tranche: month,
            osoId,
          })),
          skipDuplicates: true,
        })
      }

      // Create related atlas projects
      if (project.onchain_builder_op_atlas_ids?.length) {
        // First create the related projects entries
        const relatedProjects =
          await prisma.projectOSORelatedProjects.createMany({
            data: project.onchain_builder_op_atlas_ids.map((relatedId) => ({
              projectId,
              tranche: month,
              osoId: relatedId, // Using the atlas ID as osoId for now
            })),
            skipDuplicates: true,
          })

        // Then create the atlas related projects entries
        if (relatedProjects.count > 0) {
          const relatedProjectRecords =
            await prisma.projectOSORelatedProjects.findMany({
              where: {
                projectId,
                tranche: month,
                osoId: { in: project.onchain_builder_op_atlas_ids },
              },
            })

          await prisma.projectOSOAtlasRelatedProjects.createMany({
            data: relatedProjectRecords.map((record) => ({
              projectId,
              tranche: month,
              relatedProjectId: record.id,
            })),
            skipDuplicates: true,
          })
        }
      }

      console.log(
        `Processed metrics and relations for project ${
          project.display_name || "unknown"
        } (${projectId})`,
      )
    } catch (error) {
      console.error(
        `${RED}Error processing project ${
          project.display_name || "unknown"
        } (${projectId}): ${error}${RESET}`,
      )
    }
  }
}

const processOsoData = async ({
  files,
  month,
  mission,
}: ProcessOsoDataArgs) => {
  console.log("Processing OSO data with:", {
    files,
    month,
    mission,
  })

  // Read and process the first file
  const firstFile = files[0]

  if (mission === Mission.ONCHAIN_BUILDER) {
    const data = readJsonFile<OnchainBuilderProject>(firstFile)
    await processOnchainBuilderData(data, month)
  } else {
    const data = readJsonFile<DevToolingProject>(firstFile)
    await processDevToolingData(data, month)
  }
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
processOsoData({ files, month, mission }).catch(console.error)
