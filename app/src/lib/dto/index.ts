import type {
  KYCStatus,
  PrismaClient,
  UserAddress,
  UserEmail,
  UserInteraction,
  UserSafeAddress,
} from "@prisma/client"

export type UserPublicDTO = {
  id: string
  name: string | null
  username: string | null
  imageUrl: string | null
  bio: string | null
  farcasterId: string | null
  github: string | null
  discord: string | null
  twitter: string | null
  govForumProfileUrl: string | null
}

export type UserViewerDTO = UserPublicDTO & {
  emails: Array<{
    email: UserEmail["email"]
    verified: UserEmail["verified"]
    createdAt: UserEmail["createdAt"]
    updatedAt: UserEmail["updatedAt"]
  }>
  addresses: Array<{
    address: UserAddress["address"]
    source: UserAddress["source"]
    primary: UserAddress["primary"]
    createdAt: UserAddress["createdAt"]
    updatedAt: UserAddress["updatedAt"]
  }>
  safeAddresses: Array<{
    id: UserSafeAddress["id"]
    safeAddress: UserSafeAddress["safeAddress"]
    createdAt: UserSafeAddress["createdAt"]
  }>
  privyDid: string | null
  notDeveloper: boolean
  interaction: UserInteraction | null
}

export type UserSearchDTO = Pick<
  UserPublicDTO,
  "id" | "name" | "username" | "imageUrl" | "farcasterId"
>

export type PublicUserAddressDTO = {
  address: UserAddress["address"]
  primary: UserAddress["primary"]
}

export type UserProfilePublicDTO = UserPublicDTO & {
  addresses: PublicUserAddressDTO[]
}

export type OrganizationListItemDTO = {
  id: string
  name: string
  avatarUrl: string | null
}

export type PublicProjectRewardDTO = {
  id: string
  amount: number
  roundId: number | null
}

export type PublicProjectCardDTO = {
  id: string
  name: string
  description: string | null
  thumbnailUrl: string | null
  rewards: PublicProjectRewardDTO[]
}

export type PublicOrganizationTeamMemberDTO = {
  id: string
  organizationId: string
  userId: string
  user: UserPublicDTO | null
}

export type PublicOrganizationProjectDTO = {
  id: string
  organizationId: string
  projectId: string
  project: PublicProjectCardDTO | null
}

export type PublicOrganizationProfileDTO = {
  id: string
  name: string
  avatarUrl: string | null
  coverUrl: string | null
  description: string | null
  website: string[]
  farcaster: string[]
  twitter: string | null
  team: PublicOrganizationTeamMemberDTO[]
  projects: PublicOrganizationProjectDTO[]
}

export type ActionUserPreviewDTO = Pick<
  UserPublicDTO,
  "id" | "name" | "imageUrl"
>

export interface ActionProjectTeamMemberDTO {
  id?: string
  role?: string | null
  user?: ActionUserPreviewDTO | null
}

export interface ActionOrganizationTeamMemberDTO {
  id?: string
  organizationId?: string
  userId?: string
  role?: string | null
  user?: ActionUserPreviewDTO | null
}

export interface ActionProjectApplicationDTO {
  id: string
  roundId: string | null
  status: string | null
  attestationId: string | null
}

export interface ActionProjectRewardDTO {
  id: string
  roundId: string | null
  amount: number | string | { toString(): string }
  claim: {
    status: string | null
  } | null
}

export interface ActionProjectSnapshotDTO {
  createdAt: Date
}

export interface ProjectActionOrganizationSummaryDTO {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  coverUrl: string | null
  team: ActionOrganizationTeamMemberDTO[]
}

export interface ProjectActionOrganizationLinkDTO {
  organization: ProjectActionOrganizationSummaryDTO | null
}

export interface ProjectActionDTO {
  id: string
  createdAt: Date
  deletedAt: Date | null
  name: string
  description: string | null
  thumbnailUrl: string | null
  website: string[]
  hasCodeRepositories: boolean | null
  openSourceObserverSlug: string | null
  team: ActionProjectTeamMemberDTO[]
  organization: ProjectActionOrganizationLinkDTO | null
  applications: ActionProjectApplicationDTO[]
  rewards: ActionProjectRewardDTO[]
  snapshots: ActionProjectSnapshotDTO[]
  lastMetadataUpdate: Date
  kycTeam: {
    rewardStreams: Array<{
      round?: unknown
    }>
  } | null
}

export interface OrganizationActionProjectDTO {
  id: string
  organizationId: string
  projectId: string
  project: ProjectActionDTO | null
}

export interface OrganizationActionDTO
  extends ProjectActionOrganizationSummaryDTO {
  projects: OrganizationActionProjectDTO[]
}

export interface UserOrganizationActionDTO {
  id: string
  organizationId: string
  role: string
  organization: OrganizationActionDTO
}

export interface ProjectSelectionDTO {
  id: string
  name: string
  thumbnailUrl: string | null
}

export interface ProjectSelectionLinkDTO {
  project: ProjectSelectionDTO
}

export interface UserAdminProjectsActionDTO {
  projects: ProjectSelectionLinkDTO[]
  organizations: Array<{
    organization: {
      projects: ProjectSelectionLinkDTO[]
    }
  }>
}

export type TrustAudience = "public" | "viewer" | "member" | "admin"
export type KycAudience = "member" | "admin"

type UnknownRecord = Record<string, unknown>
type Prop<T, K extends string> = T extends { [P in K]?: infer V } ? V : never
type UnknownArrayItem<T> = Extract<
  T extends ReadonlyArray<infer U> ? U : never,
  UnknownRecord
>
type RecordProp<T extends UnknownRecord, K extends string> = Extract<
  NonNullable<Prop<T, K>>,
  UnknownRecord
>

type WithUser = UnknownRecord & {
  user?: UnknownRecord | null
  users?: UnknownRecord | null
}

export type TeamMemberPublicDTO<T extends WithUser = WithUser> = Omit<
  T,
  "user" | "users"
> & {
  user?: UserPublicDTO | null
  users?: UserPublicDTO | null
}

export type RewardClaimMemberDTO = {
  id: string
  status: string | null
  kycStatus: string | null
  kycStatusUpdatedAt: Date | null
  tokenStreamClaimableAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type RewardClaimAdminDTO = RewardClaimMemberDTO & {
  address: string | null
}

type RewardClaimDTO<A extends Extract<TrustAudience, "member" | "admin">> =
  A extends "admin" ? RewardClaimAdminDTO : RewardClaimMemberDTO

export type RewardDTO<
  T extends UnknownRecord = UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin"> = "public",
> = Omit<T, "claim" | "addressSetBy"> & {
  claim: A extends "public"
    ? null
    : RewardClaimDTO<Extract<A, "member" | "admin">> | null
}

export type KycUserMemberDTO = {
  id: string
  status: KYCStatus
  expiry: Date | null
  updatedAt: Date | null
}

export type KycUserAdminDTO = KycUserMemberDTO & {
  firstName: string
  lastName: string
  email: string
  personaReferenceId: string | null
  UserKYCUsers: TeamMemberPublicDTO[]
}

export type KycLegalEntityControllerDTO = {
  firstName: string
  lastName: string
  email: string
}

export type KycLegalEntityMemberDTO = {
  id: string
  status: KYCStatus
  expiry: Date | null
  updatedAt: Date | null
}

export type KycLegalEntityAdminDTO = KycLegalEntityMemberDTO & {
  name: string
  businessName: string
  controllerFirstName: string
  controllerLastName: string
  controllerEmail: string
  kycLegalEntityController: KycLegalEntityControllerDTO | null
}

type KycUserDTO<A extends KycAudience> = A extends "admin"
  ? KycUserAdminDTO
  : KycUserMemberDTO

type KycLegalEntityDTO<A extends KycAudience> = A extends "admin"
  ? KycLegalEntityAdminDTO
  : KycLegalEntityMemberDTO

export type ProjectKycUsersDTO<
  A extends KycAudience = "member",
> = {
  users: Array<KycUserDTO<A>>
  legalEntities: Array<KycLegalEntityDTO<A>>
}

export type OrganizationKycTeamProjectDTO = {
  id: string
  name: string
  thumbnailUrl: string | null
}

export type OrganizationKycTeamLegalEntityLinkDTO<
  A extends KycAudience = "member",
> = UnknownRecord & {
  legalEntity: KycLegalEntityDTO<A> | null
}

export type OrganizationKycTeamPayloadDTO<
  A extends KycAudience = "member",
> = UnknownRecord & {
  walletAddress: string
  rewardStreams: Array<UnknownRecord>
  team: Array<OrganizationKycTeamMemberLinkDTO<A>>
  KYCLegalEntityTeams: Array<OrganizationKycTeamLegalEntityLinkDTO<A>>
  projects: Array<OrganizationKycTeamProjectDTO>
}

export type OrganizationKycTeamDTO<
  A extends KycAudience = "member",
> = UnknownRecord & {
  organizationId: string
  kycTeamId: string
  team: OrganizationKycTeamPayloadDTO<A>
}

export type OrganizationKycTeamMemberLinkDTO<
  A extends KycAudience = "member",
> = UnknownRecord & {
  users: KycUserDTO<A> | null
}

export type ProjectKycTeamMemberDTO = {
  id: string
  walletAddress: string
  createdAt: Date | null
  updatedAt: Date | null
  rewardStreams: Array<UnknownRecord>
}

export type ProjectKycTeamAdminDTO = ProjectKycTeamMemberDTO & {
  team: Array<OrganizationKycTeamMemberLinkDTO<"admin">>
  KYCLegalEntityTeams: Array<OrganizationKycTeamLegalEntityLinkDTO<"admin">>
  projects: Array<OrganizationKycTeamProjectDTO>
}

export type ProjectKycUsersAdminDTO = ProjectKycUsersDTO<"admin">
export type ProjectKycUsersMemberDTO = ProjectKycUsersDTO<"member">
export type OrganizationKycTeamAdminDTO = OrganizationKycTeamDTO<"admin">
export type OrganizationKycTeamMemberDTO = OrganizationKycTeamDTO<"member">

type ProjectKycTeamDTO<
  A extends Extract<TrustAudience, "member" | "admin">,
> = A extends "admin" ? ProjectKycTeamAdminDTO : ProjectKycTeamMemberDTO

export type ProjectDTO<
  T extends UnknownRecord = UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin"> = "public",
> = Omit<T, "team" | "organization" | "rewards" | "kycTeam"> & {
  team: Array<TeamMemberPublicDTO<UnknownArrayItem<Prop<T, "team">> & WithUser>>
  organization: RecordProp<T, "organization"> extends never
    ? null
    : ProjectOrganizationDTO<RecordProp<T, "organization">, A> | null
  rewards: Array<RewardDTO<UnknownArrayItem<Prop<T, "rewards">>, A>>
  kycTeam: A extends "public"
    ? null
    : ProjectKycTeamDTO<Extract<A, "member" | "admin">> | null
}

type ProjectOrganizationDTO<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
> = Omit<T, "organization"> & {
  organization: RecordProp<T, "organization"> extends never
    ? null
    : ToOrganizationDTO<RecordProp<T, "organization">, A> | null
}

export type OrganizationMemberDTO<T extends WithUser = WithUser> = Omit<
  T,
  "user"
> & {
  user: UserPublicDTO | null
}

export type OrganizationDTO<
  T extends UnknownRecord = UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin"> = "public",
> = Omit<T, "team" | "projects"> & {
  team: A extends "admin"
    ? Array<TeamMemberPublicDTO<UnknownArrayItem<Prop<T, "team">> & WithUser>>
    : Array<OrganizationMemberDTO<UnknownArrayItem<Prop<T, "team">> & WithUser>>
  projects: Array<
    Omit<UnknownArrayItem<Prop<T, "projects">>, "project"> & {
      project: RecordProp<UnknownArrayItem<Prop<T, "projects">>, "project"> extends never
        ? null
        : ProjectDTO<
            RecordProp<UnknownArrayItem<Prop<T, "projects">>, "project">,
            A
          > | null
    }
  >
}

export type ToOrganizationDTO<
  T extends UnknownRecord = UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin"> = "public",
> = RecordProp<T, "organization"> extends never
  ? OrganizationDTO<T, A>
  : OrganizationRelationDTO<T, A>

export type OrganizationRelationDTO<
  T extends UnknownRecord = UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin"> = "public",
> = Omit<T, "organization"> & {
  organization:
    | (RecordProp<T, "organization"> extends never
        ? null
        : ToOrganizationDTO<RecordProp<T, "organization">, A> | null)
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null
}

function getRecordArray(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function getNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

function getDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(0)
}

function getNullableDate(value: unknown): Date | null {
  return value instanceof Date ? value : null
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function getKycStatus(value: unknown): KYCStatus {
  return getString(value, "PENDING") as KYCStatus
}

function toKycTeamProjectDTO(
  project: UnknownRecord | null | undefined,
): OrganizationKycTeamProjectDTO | null {
  if (!project) {
    return null
  }

  return {
    id: getString(project.id),
    name: getString(project.name),
    thumbnailUrl: getNullableString(project.thumbnailUrl),
  }
}

function sanitizeEmail(email: UnknownRecord) {
  return {
    email: getString(email.email),
    verified: Boolean(email.verified),
    createdAt: getDate(email.createdAt),
    updatedAt: getDate(email.updatedAt),
  }
}

function sanitizeAddress(address: UnknownRecord) {
  return {
    address: getString(address.address),
    source: getString(address.source),
    primary: Boolean(address.primary),
    createdAt: getDate(address.createdAt),
    updatedAt: getDate(address.updatedAt),
  }
}

function sanitizePublicAddress(
  address: UnknownRecord,
): PublicUserAddressDTO {
  return {
    address: getString(address.address),
    primary: Boolean(address.primary),
  }
}

function sanitizeSafeAddress(address: UnknownRecord) {
  return {
    id: getString(address.id),
    safeAddress: getString(address.safeAddress),
    createdAt: getDate(address.createdAt),
  }
}

export function toUserPublicDTO(
  user: UnknownRecord | null | undefined,
): UserPublicDTO | null {
  if (!user) {
    return null
  }

  return {
    id: getString(user.id),
    name: getNullableString(user.name),
    username: getNullableString(user.username),
    imageUrl: getNullableString(user.imageUrl),
    bio: getNullableString(user.bio),
    farcasterId: getNullableString(user.farcasterId),
    github: getNullableString(user.github),
    discord: getNullableString(user.discord),
    twitter: getNullableString(user.twitter),
    govForumProfileUrl: getNullableString(user.govForumProfileUrl),
  }
}

export function toUserProfilePublicDTO(
  user: UnknownRecord | null | undefined,
): UserProfilePublicDTO | null {
  if (!user) {
    return null
  }

  return {
    ...toUserPublicDTO(user)!,
    addresses: getRecordArray(user.addresses).map(sanitizePublicAddress),
  }
}

export function toUserViewerDTO(
  user: UnknownRecord | null | undefined,
): UserViewerDTO | null {
  if (!user) {
    return null
  }

  return {
    ...toUserPublicDTO(user)!,
    emails: getRecordArray(user.emails).map(sanitizeEmail),
    addresses: getRecordArray(user.addresses).map(sanitizeAddress),
    safeAddresses: getRecordArray(user.safeAddresses).map(sanitizeSafeAddress),
    privyDid: getNullableString(user.privyDid),
    notDeveloper: Boolean(user.notDeveloper),
    interaction: (user.interaction as UserInteraction | null) ?? null,
  }
}

export function toUserSearchDTO(
  user: UnknownRecord | null | undefined,
): UserSearchDTO | null {
  if (!user) {
    return null
  }

  return {
    id: getString(user.id),
    name: getNullableString(user.name),
    username: getNullableString(user.username),
    imageUrl: getNullableString(user.imageUrl),
    farcasterId: getNullableString(user.farcasterId),
  }
}

export function toOrganizationListItemDTO(
  organization: UnknownRecord | null | undefined,
): OrganizationListItemDTO | null {
  if (!organization) {
    return null
  }

  return {
    id: getString(organization.id),
    name: getString(organization.name),
    avatarUrl: getNullableString(organization.avatarUrl),
  }
}

export function toPublicProjectCardDTO(
  project: UnknownRecord | null | undefined,
): PublicProjectCardDTO | null {
  if (!project) {
    return null
  }

  return {
    id: getString(project.id),
    name: getString(project.name),
    description: getNullableString(project.description),
    thumbnailUrl: getNullableString(project.thumbnailUrl),
    rewards: getRecordArray(project.rewards)
      .filter((reward) => Boolean(getString(reward.id)))
      .map((reward) => ({
        id: getString(reward.id),
        amount: Number(reward.amount ?? 0),
        roundId: typeof reward.roundId === "number" ? reward.roundId : null,
      })),
  }
}

export function toPublicOrganizationProfileDTO(
  organization: UnknownRecord | null | undefined,
): PublicOrganizationProfileDTO | null {
  if (!organization) {
    return null
  }

  return {
    id: getString(organization.id),
    name: getString(organization.name),
    avatarUrl: getNullableString(organization.avatarUrl),
    coverUrl: getNullableString(organization.coverUrl),
    description: getNullableString(organization.description),
    website: getStringArray(organization.website),
    farcaster: getStringArray(organization.farcaster),
    twitter: getNullableString(organization.twitter),
    team: getRecordArray(organization.team).map((member) => ({
      id: getString(member.id),
      organizationId: getString(member.organizationId),
      userId: getString(member.userId),
      user: toUserPublicDTO(getRecord(member.user)),
    })),
    projects: getRecordArray(organization.projects).map((projectRef) => ({
      id: getString(projectRef.id),
      organizationId: getString(projectRef.organizationId),
      projectId: getString(projectRef.projectId),
      project: toPublicProjectCardDTO(getRecord(projectRef.project)),
    })),
  }
}

export function toScopedUserDTO(
  user: UnknownRecord | null | undefined,
  audience: Extract<TrustAudience, "public" | "viewer">,
): UserPublicDTO | UserViewerDTO | null {
  if (audience === "viewer") {
    return toUserViewerDTO(user)
  }

  return toUserPublicDTO(user)
}

function sanitizeMemberWithPublicUser<T extends WithUser>(
  member: T,
): TeamMemberPublicDTO<T> {
  const user = "user" in member ? member.user : undefined
  const users = "users" in member ? member.users : undefined

  return {
    ...(member as Omit<T, "user" | "users">),
    ...(user !== undefined ? { user: toUserPublicDTO(user) } : {}),
    ...(users !== undefined ? { users: toUserPublicDTO(users) } : {}),
  }
}

function sanitizeRewardClaim<A extends Extract<TrustAudience, "member" | "admin">>(
  claim: UnknownRecord | null | undefined,
  audience: A,
): RewardClaimDTO<A> | null {
  if (!claim) {
    return null
  }

  const memberClaim: RewardClaimMemberDTO = {
    id: getString(claim.id),
    status: getNullableString(claim.status),
    kycStatus: getNullableString(claim.kycStatus),
    kycStatusUpdatedAt: getNullableDate(claim.kycStatusUpdatedAt),
    tokenStreamClaimableAt: getNullableDate(claim.tokenStreamClaimableAt),
    createdAt: getDate(claim.createdAt),
    updatedAt: getDate(claim.updatedAt),
  }

  if (audience === "admin") {
    return {
      ...memberClaim,
      address: getNullableString(claim.address),
    } as RewardClaimDTO<A>
  }

  return memberClaim as RewardClaimDTO<A>
}

function sanitizeRewards<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
>(
  rewards: T[] | null | undefined,
  audience: A,
): Array<RewardDTO<T, A>> {
  if (!Array.isArray(rewards)) {
    return []
  }

  return rewards.map((reward) => {
    const rewardRecord = reward as T & {
      claim?: UnknownRecord | null
      addressSetBy?: unknown
    }
    const { claim, addressSetBy: _addressSetBy, ...rest } = rewardRecord

    if (audience === "public") {
      return {
        ...rest,
        claim: null,
      } as RewardDTO<T, A>
    }

    return {
      ...rest,
      claim: sanitizeRewardClaim(getRecord(claim), audience),
    } as RewardDTO<T, A>
  })
}

function sanitizeProjectOrganization(
  organization: UnknownRecord | null | undefined,
  audience: Extract<TrustAudience, "public" | "member" | "admin">,
): UnknownRecord | null {
  if (!organization) {
    return null
  }

  const nestedOrganization = getRecord(organization.organization)
  if (nestedOrganization) {
    return {
      ...organization,
      organization: {
        ...nestedOrganization,
        team: getRecordArray(nestedOrganization.team).map((member) =>
          sanitizeMemberWithPublicUser(member as WithUser),
        ),
        projects:
          audience === "public"
            ? getRecordArray(nestedOrganization.projects)
            : getRecordArray(nestedOrganization.projects).map((projectRef) => ({
                ...projectRef,
                project: toProjectDTO(getRecord(projectRef.project), audience),
              })),
      },
    }
  }

  return {
    ...organization,
    team: getRecordArray(organization.team).map((member) =>
      sanitizeMemberWithPublicUser(member as WithUser),
    ),
    projects:
      audience === "public"
        ? getRecordArray(organization.projects)
        : getRecordArray(organization.projects).map((projectRef) => ({
            ...projectRef,
            project: toProjectDTO(getRecord(projectRef.project), audience),
          })),
  }
}

function sanitizeKycUser<A extends KycAudience>(
  user: UnknownRecord | null | undefined,
  audience: A,
): KycUserDTO<A> | null {
  if (!user) {
    return null
  }

  if (audience === "admin") {
    return {
      id: getString(user.id),
      status: getKycStatus(user.status),
      expiry: getNullableDate(user.expiry),
      updatedAt: getNullableDate(user.updatedAt),
      firstName: getString(user.firstName),
      lastName: getString(user.lastName),
      email: getString(user.email),
      personaReferenceId: getNullableString(user.personaReferenceId),
      UserKYCUsers: getRecordArray(user.UserKYCUsers).map((member) =>
        sanitizeMemberWithPublicUser(member as WithUser),
      ),
    } as KycUserDTO<A>
  }

  return {
    id: getString(user.id),
    status: getKycStatus(user.status),
    expiry: getNullableDate(user.expiry),
    updatedAt: getNullableDate(user.updatedAt),
  } as KycUserDTO<A>
}

function sanitizeLegalEntity<A extends KycAudience>(
  entity: UnknownRecord | null | undefined,
  audience: A,
): KycLegalEntityDTO<A> | null {
  if (!entity) {
    return null
  }

  const controller = getRecord(entity.kycLegalEntityController)

  if (audience === "admin") {
    return {
      id: getString(entity.id),
      status: getKycStatus(entity.status),
      expiry: getNullableDate(entity.expiry),
      updatedAt: getNullableDate(entity.updatedAt),
      name: getString(entity.name),
      businessName: getString(entity.businessName ?? entity.name),
      controllerFirstName: getString(
        entity.controllerFirstName ?? controller?.firstName,
      ),
      controllerLastName: getString(
        entity.controllerLastName ?? controller?.lastName,
      ),
      controllerEmail: getString(entity.controllerEmail ?? controller?.email),
      kycLegalEntityController: controller
        ? {
            firstName: getString(controller.firstName),
            lastName: getString(controller.lastName),
            email: getString(controller.email),
          }
        : null,
    } as KycLegalEntityDTO<A>
  }

  return {
    id: getString(entity.id),
    status: getKycStatus(entity.status),
    expiry: getNullableDate(entity.expiry),
    updatedAt: getNullableDate(entity.updatedAt),
  } as KycLegalEntityDTO<A>
}

function sanitizeKycTeam<A extends Extract<TrustAudience, "member" | "admin">>(
  kycTeam: UnknownRecord | null | undefined,
  audience: A,
): ProjectKycTeamDTO<A> | null {
  if (!kycTeam) {
    return null
  }

  const base: ProjectKycTeamMemberDTO = {
    id: getString(kycTeam.id),
    walletAddress: getString(kycTeam.walletAddress),
    createdAt: getNullableDate(kycTeam.createdAt),
    updatedAt: getNullableDate(kycTeam.updatedAt),
    rewardStreams: getRecordArray(kycTeam.rewardStreams),
  }

  if (audience === "admin") {
    return {
      ...base,
      team: getRecordArray(kycTeam.team).map((member) => ({
            ...member,
            users: sanitizeKycUser(getRecord(member.users), "admin"),
          })),
      KYCLegalEntityTeams: getRecordArray(kycTeam.KYCLegalEntityTeams).map(
        (link) => ({
            ...link,
            legalEntity: sanitizeLegalEntity(getRecord(link.legalEntity), "admin"),
          }),
      ),
      projects: getRecordArray(kycTeam.projects)
        .map((project) => toKycTeamProjectDTO(project))
        .filter(
          (project): project is OrganizationKycTeamProjectDTO => Boolean(project),
        ),
    } as ProjectKycTeamDTO<A>
  }

  return base as ProjectKycTeamDTO<A>
}

export function toProjectDTO<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
>(project: T, audience: A): ProjectDTO<T, A>
export function toProjectDTO<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
>(project: T | null | undefined, audience: A): ProjectDTO<T, A> | null
export function toProjectDTO<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
>(project: T | null | undefined, audience: A): ProjectDTO<T, A> | null {
  if (!project) {
    return null
  }

  return {
    ...project,
    team: getRecordArray(project.team).map((member) =>
      sanitizeMemberWithPublicUser(member as WithUser),
    ),
    organization: sanitizeProjectOrganization(
      getRecord(project.organization),
      audience,
    ),
    rewards: sanitizeRewards(getRecordArray(project.rewards), audience),
    kycTeam:
      audience === "public"
        ? null
        : sanitizeKycTeam(
            getRecord(project.kycTeam),
            audience as Extract<TrustAudience, "member" | "admin">,
          ),
  } as unknown as ProjectDTO<T, A>
}

export function toOrganizationDTO<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
>(organization: T, audience: A): ToOrganizationDTO<T, A>
export function toOrganizationDTO<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
>(organization: T | null | undefined, audience: A): ToOrganizationDTO<T, A> | null
export function toOrganizationDTO<
  T extends UnknownRecord,
  A extends Extract<TrustAudience, "public" | "member" | "admin">,
>(
  organization: T | null | undefined,
  audience: A,
): ToOrganizationDTO<T, A> | null {
  if (!organization) {
    return null
  }

  const nestedOrganization = getRecord(organization.organization)
  if (nestedOrganization) {
    return {
      ...organization,
      organization: toOrganizationDTO(nestedOrganization, audience),
    } as unknown as ToOrganizationDTO<T, A>
  }

  return {
    ...organization,
    team: getRecordArray(organization.team).map((member) =>
          audience === "admin"
            ? sanitizeMemberWithPublicUser(member as WithUser)
            : {
                ...member,
                id: getString(member.id),
                organizationId: getString(member.organizationId),
                userId: getString(member.userId),
                user: toUserPublicDTO(getRecord(member.user)),
              },
        ),
    projects: getRecordArray(organization.projects).map((projectRef) => ({
          ...projectRef,
          project: toProjectDTO(
            getRecord(projectRef.project),
            audience === "public" ? "public" : audience,
          ),
        })),
  } as unknown as ToOrganizationDTO<T, A>
}

export function toProjectKycUsersDTO<A extends KycAudience>(
  payload: {
    users?: UnknownRecord[]
    legalEntities?: UnknownRecord[]
  } | null,
  audience: A,
): ProjectKycUsersDTO<A> {
  if (!payload) {
    return {
      users: [],
      legalEntities: [],
    }
  }

  return {
    users: getRecordArray(payload.users)
      .map((user) => sanitizeKycUser(user, audience))
      .filter((user): user is KycUserDTO<A> => Boolean(user)),
    legalEntities: getRecordArray(payload.legalEntities)
      .map((entity) => sanitizeLegalEntity(entity, audience))
      .filter((entity): entity is KycLegalEntityDTO<A> => Boolean(entity)),
  }
}

export function toOrganizationKycTeamsDTO<A extends KycAudience>(
  teams: UnknownRecord[] | null | undefined,
  audience: A,
): OrganizationKycTeamDTO<A>[] {
  if (!teams) {
    return []
  }

  return getRecordArray(teams).map((item) => {
    const team = getRecord(item.team)

    return {
      ...item,
      organizationId: getString(item.organizationId),
      kycTeamId: getString(item.kycTeamId),
      team: {
        ...(team ?? {}),
        walletAddress: getString(team?.walletAddress),
        rewardStreams: getRecordArray(team?.rewardStreams),
        team: getRecordArray(team?.team).map((member) => ({
          ...member,
          users: sanitizeKycUser(getRecord(member.users), audience),
        })),
        KYCLegalEntityTeams: getRecordArray(team?.KYCLegalEntityTeams).map(
          (link) => ({
            ...link,
            legalEntity: sanitizeLegalEntity(getRecord(link.legalEntity), audience),
          }),
        ),
        projects: getRecordArray(team?.projects)
          .map((project) => toKycTeamProjectDTO(project))
          .filter(
            (project): project is OrganizationKycTeamProjectDTO => Boolean(project),
          ),
      },
    }
  })
}

export async function getProjectAudience(
  db: PrismaClient,
  projectId: string,
  userId: string | null,
): Promise<Extract<TrustAudience, "public" | "member" | "admin">> {
  if (!userId) {
    return "public"
  }

  const [projectMembership, organizationMembership] = await Promise.all([
    db.userProjects.findFirst({
      where: {
        projectId,
        userId,
        deletedAt: null,
      },
      select: { role: true },
    }),
    db.userOrganization.findFirst({
      where: {
        userId,
        deletedAt: null,
        organization: {
          projects: {
            some: {
              projectId,
              deletedAt: null,
            },
          },
        },
      },
      select: { role: true },
    }),
  ])

  if (
    projectMembership?.role === "admin" ||
    organizationMembership?.role === "admin"
  ) {
    return "admin"
  }

  if (projectMembership || organizationMembership) {
    return "member"
  }

  return "public"
}

export async function getOrganizationAudience(
  db: PrismaClient,
  organizationId: string,
  userId: string | null,
): Promise<Extract<TrustAudience, "public" | "member" | "admin">> {
  if (!userId) {
    return "public"
  }

  const membership = await db.userOrganization.findFirst({
    where: {
      organizationId,
      userId,
      deletedAt: null,
    },
    select: { role: true },
  })

  if (!membership) {
    return "public"
  }

  return membership.role === "admin" ? "admin" : "member"
}

export async function getKycAudienceForProject(
  db: PrismaClient,
  projectId: string,
  userId: string,
): Promise<KycAudience | null> {
  const audience = await getProjectAudience(db, projectId, userId)
  if (audience === "public") {
    return null
  }

  return audience === "admin" ? "admin" : "member"
}

export async function getKycAudienceForOrganization(
  db: PrismaClient,
  organizationId: string,
  userId: string,
): Promise<KycAudience | null> {
  const audience = await getOrganizationAudience(db, organizationId, userId)
  if (audience === "public") {
    return null
  }

  return audience === "admin" ? "admin" : "member"
}
