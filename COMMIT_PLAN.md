# Commit Plan

The repository has a large surface area of changes that naturally fall into the following thematic groups. Each group below is intended to become its own commit so that history stays reviewable and bisectable. All files touched in the working tree are represented exactly once.

---

## 1. `docs: add admin impersonation plan and agent guidelines`

**Files**
- `ADMIN_IMPERSONATION_PLAN.md`
- `ADMIN_IMPERSONATION_REVIEW.md`
- `AGENTS.md`
- `CLAUDE.md`

**Notes**
- Introduces the planning/review docs that capture the impersonation scope plus agent guidance. Keeping these together creates a single documentation-only commit.

---

## 2. `feat: introduce admin impersonation infrastructure`

**Files**
- `app/src/auth.ts`
- `app/src/serverAuth.ts`
- `app/src/db/adminClient.ts`
- `app/src/lib/auth/adminWallets.ts`
- `app/src/lib/auth/adminConfig.ts`
- `app/src/lib/auth/impersonationSession.ts`
- `app/src/lib/db/helpers.ts`
- `app/src/lib/db/sessionContext.ts`
- `app/src/lib/impersonationContext.ts`
- `app/src/lib/services/impersonationService.ts`
- `app/src/app/api/admin/impersonate/route.ts`
- `app/src/app/api/admin/impersonation-status/route.ts`
- `app/src/app/api/admin/search-users/route.ts`
- `app/src/components/admin/AdminImpersonationButton.tsx`
- `app/src/components/admin/AdminImpersonationButtonWrapper.tsx`
- `app/src/components/admin/ImpersonationBanner.tsx`
- `app/src/components/admin/UserSearchAutocomplete.tsx`
- `app/src/components/common/Account.tsx`
- `app/src/components/common/Navbar.tsx`
- `app/src/components/ui/alert.tsx`
- `app/src/providers/AnalyticsProvider.tsx`
- `app/src/providers/LayoutProvider.tsx`
- `app/src/providers/PosthogProvider.tsx`

**Notes**
- Captures the foundational auth/session helpers, dual Prisma plumbing, admin-only API routes, shared providers, and UI controls that expose the impersonation toggle. Keeping these together makes it easy to review the core feature in isolation before any downstream adoption.

---

## 3. `refactor: route API handlers through session-aware db & impersonation guards`

**Files**
- `app/src/app/api/cron/kyc-emails/route.ts`
- `app/src/app/api/kyc/verify/[token]/route.ts`
- `app/src/app/api/projects/[projectId]/contracts/count/route.ts`
- `app/src/app/api/projects/[projectId]/contracts/publish-progress/route.ts`
- `app/src/app/api/sc/endorsements/eligibility/route.ts`
- `app/src/app/api/sc/endorsements/me/route.ts`
- `app/src/app/api/sc/endorsements/route.ts`
- `app/src/app/api/sc/top100/route.ts`
- `app/src/app/api/upload/route.ts`
- `app/src/app/api/world/verify/route.ts`
- `app/src/app/api/test-auth/route.ts` (removed)

**Notes**
- All non-admin API handlers now depend on `withSessionDb`/impersonation-aware flows (including the World ID mock and the removal of the legacy test endpoint). Keeping these endpoints together ensures reviewers can see every HTTP-facing change at once.

---

## 4. `refactor: propagate session-aware Prisma clients across db modules`

**Files**
- `app/src/db/apiUser.ts`
- `app/src/db/category.ts`
- `app/src/db/citizens.ts`
- `app/src/db/endorsements.ts`
- `app/src/db/githubProxomity.ts`
- `app/src/db/grantEligibility.ts`
- `app/src/db/kyc.ts`
- `app/src/db/organizations.ts`
- `app/src/db/projects.ts`
- `app/src/db/rewards.ts`
- `app/src/db/role.ts`
- `app/src/db/userKyc.ts`
- `app/src/db/users.ts`
- `app/src/db/votes.ts`

**Notes**
- These modules all adopted optional `PrismaClient` parameters and impersonation-safe helpers. Committing them together keeps ORM-related churn quarantined from higher-level logic.

---

## 5. `refactor: align server actions and shared libs with impersonation context`

**Files**
- `app/src/lib/actions/addresses.ts`
- `app/src/lib/actions/applications.ts`
- `app/src/lib/actions/citizens.ts`
- `app/src/lib/actions/contracts.ts`
- `app/src/lib/actions/emails.ts`
- `app/src/lib/actions/grantEligibility.ts`
- `app/src/lib/actions/kyc.ts`
- `app/src/lib/actions/organizations.ts`
- `app/src/lib/actions/persona.ts`
- `app/src/lib/actions/projects.ts`
- `app/src/lib/actions/proposals.ts`
- `app/src/lib/actions/repos.ts`
- `app/src/lib/actions/results.ts`
- `app/src/lib/actions/rewards.ts`
- `app/src/lib/actions/role.ts`
- `app/src/lib/actions/snapshots.ts`
- `app/src/lib/actions/tags.ts`
- `app/src/lib/actions/userKyc.ts`
- `app/src/lib/actions/users.ts`
- `app/src/lib/actions/utils.ts`
- `app/src/lib/actions/hookFetchers.ts`
- `app/src/lib/hooks.ts`
- `app/src/lib/proposals.ts`
- `app/src/lib/services/top100.ts`
- `app/src/lib/utils/changelog.ts`

**Notes**
- All server actions and shared libs now call `withSessionDb`, use impersonation guards/mocks, or forward the optional Prisma client through. Grouping them keeps business-logic changes in one reviewable slice.

---

## 6. `refactor: update React hooks to consume session-aware actions`

**Files**
- `app/src/hooks/citizen/useUserCitizen.ts`
- `app/src/hooks/db/useAdminProjects.tsx`
- `app/src/hooks/db/useExpiredKYCCount.ts`
- `app/src/hooks/db/useGetRandomProjects.tsx`
- `app/src/hooks/db/useGithubProximity.tsx`
- `app/src/hooks/db/useKYCProject.ts`
- `app/src/hooks/db/useOrganization.ts`
- `app/src/hooks/db/useOrganizationKycTeam.ts`
- `app/src/hooks/db/useProject.ts`
- `app/src/hooks/db/useProjectContracts.tsx`
- `app/src/hooks/db/useProjectDetails.tsx`
- `app/src/hooks/db/useUser.ts`
- `app/src/hooks/db/useUserAdminProjects.ts`
- `app/src/hooks/db/useUserApplications.tsx`
- `app/src/hooks/db/useUserPassports.ts`
- `app/src/hooks/db/useUserProjects.tsx`
- `app/src/hooks/db/useUserRoundApplications.tsx`
- `app/src/hooks/db/useUserWorldId.ts`
- `app/src/hooks/privy/usePrivyFarcaster.ts`
- `app/src/hooks/privy/usePrivyLinkEmail.ts`
- `app/src/hooks/useProjectContracts.tsx`
- `app/src/hooks/useWallet.ts`
- `app/src/hooks/voting/useMyVote.ts`
- `app/src/hooks/voting/useProposalCandidates.ts`

**Notes**
- Every hook now delegates to the updated server actions, respects impersonation state, or proxies cache invalidations correctly. Keeping hook changes separate highlights client-side data plumbing without mixing in page/UI edits.

---

## 7. `feat: update Next.js pages for impersonation-aware UX`

**Files**
- `app/src/app/application/5/page.tsx`
- `app/src/app/application/6/page.tsx`
- `app/src/app/application/page.tsx`
- `app/src/app/citizenship/components/ChainAppRequirements.tsx`
- `app/src/app/citizenship/components/UserRequirements.tsx`
- `app/src/app/citizenship/page.tsx`
- `app/src/app/dashboard/page.tsx`
- `app/src/app/governance/page.tsx`
- `app/src/app/governance/roles/[roleId]/apply/[applicationId]/components/AnalyticsTracker.tsx`
- `app/src/app/governance/roles/[roleId]/apply/[applicationId]/page.tsx`
- `app/src/app/governance/roles/[roleId]/apply/components/AnalyticsTracker.tsx`
- `app/src/app/governance/roles/[roleId]/apply/components/UserForm.tsx`
- `app/src/app/governance/roles/[roleId]/apply/page.tsx`
- `app/src/app/governance/roles/[roleId]/components/AnalyticsTracker.tsx`
- `app/src/app/governance/roles/[roleId]/components/Sidebar.tsx`
- `app/src/app/grant-eligibility/[formId]/page.tsx`
- `app/src/app/missions/[id]/application/page.tsx`
- `app/src/app/missions/page.tsx`
- `app/src/app/profile/ProfileSidebar.tsx`
- `app/src/app/profile/connected-apps/page.tsx`
- `app/src/app/profile/details/content.tsx`
- `app/src/app/profile/details/page.tsx`
- `app/src/app/profile/organizations/[organizationId]/grant-address/page.tsx`
- `app/src/app/profile/organizations/[organizationId]/page.tsx`
- `app/src/app/profile/organizations/new/page.tsx`
- `app/src/app/profile/verified-addresses/actions.ts`
- `app/src/app/profile/verified-addresses/content.tsx`
- `app/src/app/profile/verified-addresses/page.tsx`
- `app/src/app/project/[projectId]/page.tsx`
- `app/src/app/projects/[projectId]/components/UnsavedChangesToast.Server.tsx`
- `app/src/app/projects/[projectId]/contracts/page.tsx`
- `app/src/app/projects/[projectId]/contributors/page.tsx`
- `app/src/app/projects/[projectId]/details/page.tsx`
- `app/src/app/projects/[projectId]/grant-address/page.tsx`
- `app/src/app/projects/[projectId]/grants/page.tsx`
- `app/src/app/projects/[projectId]/publish/page.tsx`
- `app/src/app/projects/[projectId]/repos/page.tsx`
- `app/src/app/projects/[projectId]/rewards/page.tsx`
- `app/src/app/projects/new/page.tsx`
- `app/src/app/rounds/page.tsx`

**Notes**
- These page-level components were updated to call the new helpers, restore anonymous access, or display impersonation banners/read-only states. Grouping them ensures a reviewer can focus purely on user-facing route changes.

---

## 8. `feat: refresh shared UI components for impersonation awareness`

**Files**
- `app/src/components/application/ApplicationSubmitted.tsx`
- `app/src/components/dashboard/index.tsx`
- `app/src/components/dialogs/AddGrantDeliveryAddressDialog.tsx`
- `app/src/components/dialogs/CitizenshipApplicationDialog.tsx`
- `app/src/components/dialogs/EditProfileDialog.tsx`
- `app/src/components/dialogs/GovernanceAddressDialog.tsx`
- `app/src/components/dialogs/ImportFromFarcasterDialog.tsx`
- `app/src/components/dialogs/SelectKYCProjectDialog.tsx`
- `app/src/components/icons/remix.tsx`
- `app/src/components/missions/application/ApplicationSubmitted.tsx`
- `app/src/components/missions/application/MissionApplication.tsx`
- `app/src/components/missions/application/MissionApplicationTabs.tsx`
- `app/src/components/missions/details/UserRoundApplicationStatusCard.tsx`
- `app/src/components/profile/CompleteProfileCallout.tsx`
- `app/src/components/profile/DiscordConnection.tsx`
- `app/src/components/profile/EmailConnection.tsx`
- `app/src/components/profile/FarcasterConnection.tsx`
- `app/src/components/profile/GithubConnection.tsx`
- `app/src/components/profile/GithubDisplay.tsx`
- `app/src/components/profile/GovForumConnection.tsx`
- `app/src/components/profile/public/ProfileHeader.tsx`
- `app/src/components/projects/ProjectSidebar.tsx`
- `app/src/components/projects/grants/grants/kyc-status/KYCStatusContainer.tsx`
- `app/src/components/projects/rewards/DeleteKYCTeamDialog.tsx`
- `app/src/components/proposals/proposalPage/VotingSidebar/VotingSidebar.tsx`
- `app/src/components/proposals/proposalPage/VotingSidebar/votingColumn/VotingColumn.tsx`
- `app/src/components/proposals/proposalsPage/components/ProposalCard.tsx`
- `app/src/components/rounds/Rounds.tsx`

**Notes**
- Committing the reusable components after the page-level changes keeps leaf UI tweaks localized. This includes the social connection widgets, dialogs, proposal/mission widgets, and the icon fix—everything shared across multiple routes.

---

This ordering flows from foundational work (docs, infrastructure) through data and domain layers (DB, actions, hooks) before landing on user-facing pages and shared components, making the history easy to follow and to bisect.***
