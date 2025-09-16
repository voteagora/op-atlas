import { PrismaClient, Prisma, KYCUserType, KYCStatus } from "@prisma/client"
import { randomBytes, createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

// This script seeds demo data:
// - Creates a handful of Organizations
// - Creates several Projects
//   - Each Project gets a KYCTeam
//   - Each KYCTeam has a variable number of KYCUsers (mix of USER and LEGAL_ENTITY)
//   - Optionally assigns the Project to one of the created Organizations
//   - Optionally adds a few regular Users to the Project team (UserProjects)
//
// Environment variables you can set when running the script:
//   ORG_COUNT         Number of organizations to create (default: 3)
//   PROJECT_COUNT     Number of projects to create (default: 5)
//   KYC_MIN           Min KYC users per project (default: 1)
//   KYC_MAX           Max KYC users per project (default: 5)
//   USERS_MIN         Min regular Users per project (default: 0)
//   USERS_MAX         Max regular Users per project (default: 3)
//   ASSIGN_ORG_PROB   Probability (0..1) that a project will be linked to an Organization (default: 0.7)
//
// Usage:
//   pnpm --filter op-atlas seed:kyc-sample
//   OR run inside app package directory: pnpm seed:kyc-sample
//
// Notes:
// - The script is non-transactional and best effort; it tries to continue on minor failures.
// - Generated emails for KYC users are unique per run to avoid conflicts.

// Inline spec support: define your explicit seed data directly here.
// Set INLINE_SPEC to an object to enable, or leave as undefined to skip.
// Example template:
const INLINE_SPEC: SeedSpec = {
  organizations: [],
  projects: [
    {
      name: "Test Project",
      description: "Seeded from inline spec",
      website: ["https://myproject.example"],
      organizationName: "",
      kycTeam: { walletAddress: "0xDBb050a8692afF8b5EF4A3F36D53900B14210E40" },
      // The user below will be created (if needed), added to the project team,
      // and used to initialize a GrantEligibility form for this project.
      createdByUser: {
        // Prefer linking by a stable identifier like wallet address or Privy DID since usernames can change.
        // Fill in one of the following to link to your existing account:
        // - addresses: ["0xYourPrimaryWallet..."]
        // - privyDid: "did:privy:..."
        // Optionally include name/emails if creating a new user.
        addresses: ["0xDBb050a8692afF8b5EF4A3F36D53900B14210E40"],
        // privyDid: "did:privy:example",
        // name: "Seed Creator",
        // emails: ["creator@example.test"],
      },
      kycUsers: [
        {
          email: "garrett@voteagora.com",
          firstName: "Garrett",
          lastName: "Berg",
          kycUserType: "USER",
          status: "PENDING",
        },
        {
          email: "acme@example.test",
          firstName: "Acme",
          lastName: "Inc",
          kycUserType: "LEGAL_ENTITY",
          businessName: "Acme Inc",
        },
      ],
      // Additional users can still be listed here to be added to the project team
      users: [
        {
          username: "teammate1",
          name: "Teammate One",
          emails: ["teammate1@example.test"],
        },
      ],
    },
  ],
}

const prisma = new PrismaClient()

// Simple inputs: define a list of entries with either an address or an email (or both).
// Either address or email must be present, but not both empty.
// Example:
// const SEED_ENTRIES: SeedEntry[] = [
//   { address: "0xDBb050a8692afF8b5EF4A3F36D53900B14210E40" },
//   { email: "garrett@voteagora.com" },
//   { address: "0x1111111111111111111111111111111111111111", email: "creator@example.test" },
// ]

type SeedEntry = { address?: string; email?: string }
const SEED_ENTRIES: SeedEntry[] = [
  // Fill with your targets. At least one field (address or email) must be present per entry.
]

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickOne<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomHexAddress(): string {
  const bytes = randomBytes(20)
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  )
}

function deterministicWalletAddress(index: number): string {
  const hex = createHash("sha256")
    .update(`op-atlas-demo-team-${index}`)
    .digest("hex")
  // take last 40 chars to mimic 20-byte address
  return "0x" + hex.slice(-40)
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function createOrganizations(count: number) {
  const created: { id: string; name: string }[] = []
  for (let i = 0; i < count; i++) {
    const name = `Demo Org ${i + 1}`
    const existing = await prisma.organization.findFirst({
      where: { name },
      select: { id: true, name: true },
    })
    if (existing) {
      created.push(existing)
      continue
    }
    const org = await prisma.organization.create({
      data: {
        name,
        description: `Autogenerated organization ${i + 1}`,
        website: [],
        farcaster: [],
      },
      select: { id: true, name: true },
    })
    created.push(org)
  }
  return created
}

// Minimal spec types (loose) to allow flexible input
// Users can pass a JSON file via SEED_SPEC env var or default to src/scripts/seed-kyc-sample.spec.json

type SeedSpec = {
  organizations?: Array<{
    name: string
    description?: string
    website?: string[]
    farcaster?: string[]
  }>
  projects?: Array<{
    name: string
    description?: string
    website?: string[]
    farcaster?: string[]
    organizationName?: string
    kycTeam?: { walletAddress?: string }
    // The primary user who "creates" the project. This user will be created (if needed),
    // attached to the project via UserProjects, and used to initiate a GrantEligibility form.
    createdByUser?: {
      username?: string
      name?: string
      emails?: string[]
      addresses?: string[]
      privyDid?: string
    }
    kycUsers?: Array<{
      email: string
      firstName: string
      lastName: string
      kycUserType?: keyof typeof KYCUserType | KYCUserType
      businessName?: string
      status?: keyof typeof KYCStatus | KYCStatus
      expiry?: string
    }>
    users?: Array<{
      username?: string
      name?: string
      emails?: string[]
      addresses?: string[]
      privyDid?: string
    }>
  }>
}

type SummaryOrganization = {
  organization: { id: string; name: string }
  source?: string
}

type SummaryProject = {
  project: { id: string; name: string }
  kycTeamId: string
  kycUserCounts: { total: number; USER: number; LEGAL_ENTITY: number }
  usersCount: number
  organization?: { id: string; name: string } | null
  source?: string
  createdByUser?: { id: string; username?: string }
  grantEligibilityId?: string
}

type SummaryItem = SummaryOrganization | SummaryProject

type SeedUserInput = {
  username?: string
  name?: string
  emails?: string[]
  addresses?: string[]
  privyDid?: string
}

async function ensureOrganizationByName(
  name: string,
  data?: { description?: string; website?: string[]; farcaster?: string[] },
) {
  const existing = await prisma.organization.findFirst({
    where: { name },
    select: { id: true, name: true },
  })
  if (existing) return existing
  return prisma.organization.create({
    data: {
      name,
      description: data?.description,
      website: data?.website ?? [],
      farcaster: data?.farcaster ?? [],
    },
    select: { id: true, name: true },
  })
}

type KYCTeamSlim = Prisma.KYCTeamGetPayload<{
  select: { id: true; walletAddress: true }
}>

async function ensureKycTeamByWallet(
  walletAddress?: string,
): Promise<KYCTeamSlim> {
  const wallet =
    walletAddress && walletAddress.startsWith("0x")
      ? walletAddress
      : randomHexAddress()
  let team = await prisma.kYCTeam.findUnique({
    where: { walletAddress: wallet },
    select: { id: true, walletAddress: true },
  })
  if (!team)
    team = await prisma.kYCTeam.create({
      data: { walletAddress: wallet },
      select: { id: true, walletAddress: true },
    })
  return team
}

type ProjectSlim = Prisma.ProjectGetPayload<{
  select: { id: true; name: true; kycTeamId: true }
}>

async function ensureProjectWithTeamAndOrg(input: {
  name: string
  description?: string
  website?: string[]
  farcaster?: string[]
  kycTeamWallet?: string
  organizationName?: string
}): Promise<{ project: ProjectSlim; team: KYCTeamSlim }> {
  const team = await ensureKycTeamByWallet(input.kycTeamWallet)
  let project: ProjectSlim | null = await prisma.project.findFirst({
    where: { name: input.name },
    select: { id: true, name: true, kycTeamId: true },
  })
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        website: input.website ?? [],
        farcaster: input.farcaster ?? [],
        kycTeamId: team.id,
      },
      select: { id: true, name: true, kycTeamId: true },
    })
  } else if (!project.kycTeamId) {
    await prisma.project.update({
      where: { id: project.id },
      data: { kycTeamId: team.id },
    })
    project.kycTeamId = team.id
  }

  if (input.organizationName) {
    const org = await ensureOrganizationByName(input.organizationName)
    const existingPO = await prisma.projectOrganization.findFirst({
      where: { projectId: project.id },
    })
    if (!existingPO) {
      await prisma.projectOrganization.create({
        data: { projectId: project.id, organizationId: org.id },
      })
    }
    // Ensure OrganizationKYCTeam link too
    const existingOKT = await prisma.organizationKYCTeam.findFirst({
      where: { organizationId: org.id, kycTeamId: team.id },
    })
    if (!existingOKT) {
      await prisma.organizationKYCTeam.create({
        data: { organizationId: org.id, kycTeamId: team.id },
      })
    }
  }

  return { project, team }
}

async function addKycUsersToTeam(
  kycTeamId: string,
  kycUsers: NonNullable<SeedSpec["projects"]>[number]["kycUsers"],
) {
  const created: { id: string; email: string; type: KYCUserType }[] = []
  for (const u of kycUsers ?? []) {
    const typeVal =
      typeof u.kycUserType === "string"
        ? (KYCUserType as Record<string, KYCUserType>)[u.kycUserType] ??
          KYCUserType.USER
        : u.kycUserType ?? KYCUserType.USER
    const statusVal =
      typeof u.status === "string"
        ? (KYCStatus as Record<string, KYCStatus>)[u.status] ??
          KYCStatus.PENDING
        : u.status ?? KYCStatus.PENDING
    let kycUser = await prisma.kYCUser.findFirst({
      where: { email: u.email },
      select: { id: true },
    })
    if (!kycUser) {
      kycUser = await prisma.kYCUser.create({
        data: {
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          businessName: u.businessName,
          status: statusVal,
          expiry: u.expiry
            ? new Date(u.expiry)
            : new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
          kycUserType: typeVal,
        },
        select: { id: true },
      })
    }
    const existingMembership = await prisma.kYCUserTeams.findFirst({
      where: { kycUserId: kycUser.id, kycTeamId },
    })
    if (!existingMembership) {
      await prisma.kYCUserTeams.create({
        data: { kycUserId: kycUser.id, kycTeamId },
      })
    }
    created.push({
      id: kycUser.id,
      email: u.email,
      type: typeVal ?? KYCUserType.USER,
    })
  }
  return created
}

async function ensureUserWithDetails(u: SeedUserInput) {
  let user = null as null | { id: string; username: string | null }
  if (u.username) {
    user = await prisma.user.findFirst({
      where: { username: u.username },
      select: { id: true, username: true },
    })
  }
  // Lookup by privyDid if provided
  if (!user && u.privyDid) {
    user = await prisma.user.findFirst({
      where: { privyDid: u.privyDid },
      select: { id: true, username: true },
    })
  }
  if (!user) {
    // Try via first email
    const email = u.emails && u.emails.length > 0 ? u.emails[0] : undefined
    if (email) {
      const existingEmail = await prisma.userEmail.findFirst({
        where: { email },
        select: {
          userId: true,
          user: { select: { id: true, username: true } },
        },
      })
      if (existingEmail?.user) {
        user = existingEmail.user
      }
    }
  }
  // Lookup by any provided address
  if (!user && (u.addresses?.length ?? 0) > 0) {
    for (const address of u.addresses!) {
      const existingAddress = await prisma.userAddress.findFirst({
        where: { address },
        select: { user: { select: { id: true, username: true } } },
      })
      if (existingAddress?.user) {
        user = existingAddress.user
        break
      }
    }
  }
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: u.name ?? u.username ?? "Seed User",
        username: u.username,
        privyDid: u.privyDid,
      },
      select: { id: true, username: true },
    })
  }

  // Attach emails
  for (const email of u.emails ?? []) {
    const exists = await prisma.userEmail.findFirst({
      where: { email },
      select: { id: true },
    })
    if (!exists) {
      await prisma.userEmail.create({ data: { email, userId: user.id } })
    }
  }

  // Attach addresses
  let primarySet = false
  for (const address of u.addresses ?? []) {
    try {
      const existingAddress = await prisma.userAddress.findFirst({
        where: { address },
        select: { address: true, userId: true, primary: true },
      })
      if (!existingAddress) {
        await prisma.userAddress.create({
          data: {
            address,
            userId: user.id,
            source: "seed",
            primary: !primarySet,
          },
        })
        primarySet = true
      } else if (
        existingAddress.userId === user.id &&
        !existingAddress.primary &&
        !primarySet
      ) {
        await prisma.userAddress.update({
          where: { address: existingAddress.address },
          data: { primary: true },
        })
        primarySet = true
      }
    } catch (e) {
      // ignore address conflicts belonging to other users
    }
  }

  return user
}

async function linkUserToProject(userId: string, projectId: string) {
  const existingMembership = await prisma.userProjects.findFirst({
    where: { userId, projectId },
  })
  if (!existingMembership) {
    await prisma.userProjects.create({ data: { userId, projectId } })
  }
}

async function addRegularUsersToProject(
  projectId: string,
  users: SeedUserInput[] | undefined,
) {
  const created: { id: string; username?: string }[] = []
  for (const u of users ?? []) {
    const user = await ensureUserWithDetails(u)
    await linkUserToProject(user.id, projectId)
    created.push({ id: user.id, username: user.username ?? undefined })
  }
  return created
}

async function ensureGrantEligibilityForProject(
  projectId: string,
  kycTeamId?: string,
  createdByUserId?: string,
): Promise<{ id: string }> {
  // Check if a form already exists for this project
  const existing = await prisma.grantEligibility.findFirst({
    where: { projectId },
    select: { id: true },
  })
  if (existing) return existing

  // collect user emails and primary address to embed into form data
  let contactEmails: string[] = []
  let walletAddress: string | undefined
  if (createdByUserId) {
    const emails = await prisma.userEmail.findMany({
      where: { userId: createdByUserId },
      select: { email: true },
      orderBy: { createdAt: "asc" },
    })
    contactEmails = emails.map((e) => e.email)
    const primaryAddr = await prisma.userAddress.findFirst({
      where: { userId: createdByUserId, primary: true },
      select: { address: true },
    })
    walletAddress = primaryAddr?.address ?? undefined
  }

  const form = await prisma.grantEligibility.create({
    data: {
      currentStep: 1,
      data: {
        contactEmails,
        createdByUserId,
      } as Prisma.InputJsonObject,
      walletAddress,
      projectId,
      kycTeamId,
    },
    select: { id: true },
  })
  return form
}

async function processProvidedSpec(
  spec: SeedSpec,
  summary: SummaryItem[],
  source: string,
) {
  // Organizations
  for (const org of spec.organizations ?? []) {
    const created = await ensureOrganizationByName(org.name, org)
    summary.push({ organization: created, source })
  }

  // Projects
  for (const p of spec.projects ?? []) {
    // If a creator is provided, ensure the user first
    let createdByUser: { id: string; username: string | null } | null = null
    if (p.createdByUser) {
      createdByUser = await ensureUserWithDetails(p.createdByUser)
    }

    const { project, team } = await ensureProjectWithTeamAndOrg({
      name: p.name,
      description: p.description,
      website: p.website,
      farcaster: p.farcaster,
      kycTeamWallet: p.kycTeam?.walletAddress,
      organizationName: p.organizationName,
    })

    // Link the creator to the project
    if (createdByUser) {
      await linkUserToProject(createdByUser.id, project.id)
    }

    // Create a GrantEligibility form for this project by the creator
    let grantEligibility: { id: string } | null = null
    try {
      grantEligibility = await ensureGrantEligibilityForProject(
        project.id,
        team.id,
        createdByUser?.id,
      )
    } catch (e) {
      // non-fatal
    }

    const kycUsers = await addKycUsersToTeam(team.id, p.kycUsers)
    const users = await addRegularUsersToProject(project.id, p.users)

    summary.push({
      project: { id: project.id, name: project.name },
      kycTeamId: team.id,
      kycUserCounts: {
        total: kycUsers.length,
        USER: kycUsers.filter((u) => u.type === KYCUserType.USER).length,
        LEGAL_ENTITY: kycUsers.filter(
          (u) => u.type === KYCUserType.LEGAL_ENTITY,
        ).length,
      },
      usersCount: users.length + (createdByUser ? 1 : 0),
      createdByUser: createdByUser
        ? {
            id: createdByUser.id,
            username: createdByUser.username ?? undefined,
          }
        : undefined,
      grantEligibilityId: grantEligibility?.id,
      source,
    })
  }
}

async function processSpecIfPresent(summary: SummaryItem[]) {
  // 1) Inline spec in this file (preferred if you don't want external JSON)
  if (
    INLINE_SPEC &&
    ((INLINE_SPEC.organizations?.length ?? 0) > 0 ||
      (INLINE_SPEC.projects?.length ?? 0) > 0)
  ) {
    await processProvidedSpec(INLINE_SPEC, summary, "inline")
  }

  // 2) Optional JSON spec file (backward compatible)
  const specPathEnv = process.env.SEED_SPEC
  const defaultPath = path.join(
    process.cwd(),
    "src",
    "scripts",
    "seed-kyc-sample.spec.json",
  )
  const specPath = specPathEnv
    ? path.isAbsolute(specPathEnv)
      ? specPathEnv
      : path.join(process.cwd(), specPathEnv)
    : defaultPath
  if (!existsSync(specPath)) {
    return
  }
  try {
    const raw = readFileSync(specPath, "utf8")
    const spec = JSON.parse(raw) as SeedSpec

    // Organizations
    for (const org of spec.organizations ?? []) {
      const created = await ensureOrganizationByName(org.name, org)
      summary.push({ organization: created })
    }

    // Projects
    for (const p of spec.projects ?? []) {
      const { project, team } = await ensureProjectWithTeamAndOrg({
        name: p.name,
        description: p.description,
        website: p.website,
        farcaster: p.farcaster,
        kycTeamWallet: p.kycTeam?.walletAddress,
        organizationName: p.organizationName,
      })

      const kycUsers = await addKycUsersToTeam(team.id, p.kycUsers)
      const users = await addRegularUsersToProject(project.id, p.users)

      summary.push({
        project: { id: project.id, name: project.name },
        kycTeamId: team.id,
        kycUserCounts: {
          total: kycUsers.length,
          USER: kycUsers.filter((u) => u.type === KYCUserType.USER).length,
          LEGAL_ENTITY: kycUsers.filter(
            (u) => u.type === KYCUserType.LEGAL_ENTITY,
          ).length,
        },
        usersCount: users.length,
        source: "spec",
      })
    }
  } catch (e) {
    console.warn("Failed to load or process spec:", e)
  }
}

async function createKycUsersForTeam(
  kycTeamId: string,
  count: number,
  projectIndex: number,
) {
  const created: { id: string; email: string; type: KYCUserType }[] = []
  for (let i = 0; i < count; i++) {
    // deterministic type toggle based on hash
    const h = createHash("sha256")
      .update(`kyc-${projectIndex}-${i}`)
      .digest("hex")
    const type =
      parseInt(h.slice(0, 2), 16) % 10 < 7
        ? KYCUserType.USER
        : KYCUserType.LEGAL_ENTITY
    const firstName = type === KYCUserType.USER ? `Alice${i}` : `Legal${i}`
    const lastName = type === KYCUserType.USER ? `Builder${i}` : `Entity${i}`
    const email = `${slugify(firstName)}.${slugify(
      lastName,
    )}.p${projectIndex}.i${i}@example.test`

    let kycUser = await prisma.kYCUser.findFirst({
      where: { email },
      select: { id: true },
    })
    if (!kycUser) {
      kycUser = await prisma.kYCUser.create({
        data: {
          email,
          firstName,
          lastName,
          businessName:
            type === KYCUserType.LEGAL_ENTITY
              ? `${firstName} ${lastName} LLC`
              : undefined,
          status: KYCStatus.PENDING,
          expiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180),
          kycUserType: type,
        },
        select: { id: true },
      })
    }

    const existingMembership = await prisma.kYCUserTeams.findFirst({
      where: { kycUserId: kycUser.id, kycTeamId },
    })
    if (!existingMembership) {
      await prisma.kYCUserTeams.create({
        data: {
          kycUserId: kycUser.id,
          kycTeamId,
        },
      })
    }

    created.push({ id: kycUser.id, email, type })
  }
  return created
}

async function createRegularUsersForProject(
  projectId: string,
  count: number,
  projectIndex: number,
) {
  const created: { id: string; username?: string }[] = []
  for (let i = 0; i < count; i++) {
    const username = `demo_user_p${projectIndex}_${i}`
    let user = await prisma.user.findFirst({
      where: { username },
      select: { id: true, username: true },
    })
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `User p${projectIndex} ${i}`,
          username,
        },
        select: { id: true, username: true },
      })
    }

    const existingMembership = await prisma.userProjects.findFirst({
      where: { userId: user.id, projectId },
    })
    if (!existingMembership) {
      await prisma.userProjects.create({
        data: {
          userId: user.id,
          projectId,
        },
      })
    }

    created.push({ id: user.id, username: user.username ?? undefined })
  }
  return created
}

function hashToProbability(input: string): number {
  const h = createHash("sha256").update(input).digest("hex")
  const n = parseInt(h.slice(0, 8), 16) // 32-bit
  return (n >>> 0) / 0xffffffff
}

// Fresh simple seeding flow based on SEED_ENTRIES
async function ensureUserKycLink(userId: string, kycUserId: string) {
  try {
    await prisma.userKYCUser.create({ data: { userId, kycUserId } })
  } catch (e) {
    // ignore unique conflicts
  }
}

async function processSimpleSeed(summary: SummaryItem[]) {
  for (const entry of SEED_ENTRIES) {
    if (!entry.address && !entry.email) {
      console.warn("Skipping entry with neither address nor email")
      continue
    }

    const seedUser: SeedUserInput = {
      emails: entry.email ? [entry.email] : [],
      addresses: entry.address ? [entry.address] : [],
    }
    const user = await ensureUserWithDetails(seedUser)

    const display = entry.email ?? entry.address ?? "unknown"
    const { project, team } = await ensureProjectWithTeamAndOrg({
      name: `Project for ${display}`,
      description: `Auto-created for ${display}`,
      website: [],
      farcaster: [],
      kycTeamWallet: entry.address, // Prefer using provided address for KYCTeam wallet
    })

    await linkUserToProject(user.id, project.id)

    const form = await ensureGrantEligibilityForProject(project.id, team.id, user.id)

    // Prepare KYC user details
    const email = entry.email
      ? entry.email
      : `${(entry.address ?? "noaddr").toLowerCase().replace(/^0x/, "")}@seed.local`

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    })
    const name = userRecord?.name ?? "Seeded User"
    const [firstNameRaw, ...rest] = name.trim().split(/\s+/)
    const firstName = firstNameRaw || "Seeded"
    const lastName = rest.join(" ") || "User"

    const createdKycUsers = await addKycUsersToTeam(team.id, [
      {
        email,
        firstName,
        lastName,
        kycUserType: KYCUserType.USER,
        status: KYCStatus.PENDING,
      },
    ])

    const kycUserId = createdKycUsers[0]?.id
    if (kycUserId) {
      await ensureUserKycLink(user.id, kycUserId)
    }

    summary.push({
      project: { id: project.id, name: project.name },
      kycTeamId: team.id,
      kycUserCounts: {
        total: createdKycUsers.length,
        USER: createdKycUsers.filter((u) => u.type === KYCUserType.USER).length,
        LEGAL_ENTITY: createdKycUsers.filter(
          (u) => u.type === KYCUserType.LEGAL_ENTITY,
        ).length,
      },
      usersCount: 1,
      createdByUser: { id: user.id, username: undefined },
      grantEligibilityId: form.id,
      source: "simple",
    })
  }
}

async function main() {
  console.log("Fresh KYC seeding from SEED_ENTRIES (idempotent)...")
  const summary: SummaryItem[] = []

  await processSimpleSeed(summary)

  console.log("Seed summary:")
  console.log(JSON.stringify(summary, null, 2))
  return
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
