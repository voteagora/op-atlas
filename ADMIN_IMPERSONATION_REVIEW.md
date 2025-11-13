# Admin Impersonation Implementation Review

## Executive Summary
- Impersonation scaffolding (admin auth, session signing, dual Prisma client) is in place and most API/pages now route queries through `withImpersonation` / `withSessionDb` correctly.
- Several critical regressions remain: some public views now hard-redirect unauthenticated users, a few DB helpers still bypass the session-aware client, and external side-effects (World ID, Passport API, Persona-like flows) still execute against production while impersonating.
- UX safeguards exist (banner, read-only widgets), but a subset of read-only views still leak the admin's Privy state instead of the target user's data.
- Auditability/mocking goals from `ADMIN_IMPERSONATION_PLAN.md` are only partially implemented (`withImpersonationProtection` is unused and impersonation events are not persisted), so monitoring and containment are incomplete.

## Key Findings
1. **Public pages now require auth** – `app/src/app/project/[projectId]/page.tsx:45-52`, `app/src/app/governance/page.tsx:16-21`, `app/src/app/rounds/page.tsx:17-24`, and `app/src/app/missions/page.tsx:22-32` redirect to `/` when `userId` is absent, breaking previously public read-only routes (project detail, governance overview, rounds landing, missions list). This diverges from historical behavior and blocks anonymous visitors.
2. **Session-aware DB plumbing incomplete** – several DB helpers still use the global `prisma` and therefore hit production while impersonating (e.g., `app/src/app/dashboard/page.tsx:29-37` calls `getUserById` without the D1 client; `app/src/db/users.ts:312-334`, `app/src/db/projects.ts:1491-1500/1608-1634/2235-2255/2306/2569/2609/2993`, and `app/src/db/organizations.ts:197-349` still reference `prisma` directly).
3. **External services not mocked** – `app/src/app/api/world/verify/route.ts:12-44` still verifies proofs against Worldcoin even when impersonating; `app/src/lib/actions/users.ts:233-276` continues to call the Passport API; Persona/email hooks only cover email. This risks causing real-world side effects from the D1 session.
4. **Read-only widgets leak admin Privy data** – components like `EmailConnection` (`app/src/components/profile/EmailConnection.tsx:13-65`), `DiscordConnection` (`.../DiscordConnection.tsx:18-43`), `FarcasterConnection` (`.../FarcasterConnection.tsx:24-58`), and `GithubConnection` (`.../GithubConnection.tsx:16-63`) fall back to `usePrivy()` even in impersonation mode and can display the admin’s own social/email state instead of the impersonated user.
5. **Security/audit gaps** – `withImpersonationProtection` is never invoked, so Persona, Passport, World ID, Mailchimp, etc. still execute for impersonated flows; `app/src/lib/services/impersonationService.ts:141-190` only logs to console, leaving no durable audit trail; `app/src/lib/auth/adminConfig.ts` relies on hardcoded wallets but lacks runtime refresh.
6. **Residual direct-auth usage** – `app/src/lib/actions/userKyc.ts:412-449` still calls `auth()` + production Prisma directly, so linking orphaned KYC records runs against prod during impersonation.
7. **UI bug** – `app/src/components/icons/remix.tsx:24-40` renders `<path>` with `fill={fill}` as inner text, so the `Question` icon never paints with the requested color.

## File-by-File Notes
The following sections list every modified/added file with its review outcome. “✅” indicates no further action after inspection; “⚠️” highlights required follow-up.

### Documentation
- `ADMIN_IMPERSONATION_PLAN.md` ✅ – Plan is thorough but several checklist items (audit log persistence, complete external-service mocking) remain unimplemented; track these gaps in the backlog.
- `AGENTS.md` / `CLAUDE.md` ✅ – Repository guidance docs only; no risks.

### Admin Auth & Services
- `app/src/lib/auth/adminWallets.ts` ✅ – Hardcoded wallet list (lowercased). Ensure secure deployment process for edits.
- `app/src/lib/auth/adminConfig.ts` ⚠️ – Provides feature flags and helper queries, but `logAdminAction` only console-logs; consider persisting events per plan.
- `app/src/lib/auth/impersonationSession.ts` ✅ – Session signing/validation implemented; ensure `IMPERSONATION_SESSION_SECRET` configured.
- `app/src/lib/services/impersonationService.ts` ⚠️ – Core lifecycle works, yet `logImpersonationEvent` (lines 141-190) only prints to stdout and TODOs the audit table; switching users still spams production logs but no durable audit exists.
- `app/src/lib/impersonationContext.ts` ⚠️ – `withImpersonationProtection` is unused throughout the repo, so no external call is automatically mocked.
- `app/src/lib/db/helpers.ts` ✅ – `getSessionDatabase/getEffectiveUserId` correctly route to D1; ensure callers pass `session` when they already have one.
- `app/src/lib/db/sessionContext.ts` ✅ – `withSessionDb/withImpersonation` centralize access; options for `forceProd` cover cron usage.
- `app/src/db/adminClient.ts` ⚠️ – D1 client helper instantiates a second production Prisma client that is never used (only `getClient(true)` is referenced); drop the unused pool to avoid excess connections.

### New Admin API/UI
- `app/src/app/api/admin/impersonate/route.ts`, `.../impersonation-status/route.ts`, `.../search-users/route.ts` ✅ – Enforce admin wallet checks, signed session payloads, and D1-only reads. Status endpoint returns viewer metadata for banner.
- `app/src/components/admin/*` (button, banner, user search) ✅ – UX layers behave correctly, though switching relies on full reload; consider toast errors. Banner updates CSS var to avoid overlay issues.
- `app/src/components/ui/alert.tsx` ✅ – shadcn alert re-export used by banner.

### API Routes (non-admin)
- `app/src/app/api/cron/kyc-emails/route.ts` ✅ – Now forces production DB via `withImpersonation({ forceProd: true })`; good containment.
- `app/src/app/api/kyc/verify/[token]/route.ts` ✅ – Queries run on prod even when impersonating.
- `app/src/app/api/projects/[projectId]/contracts/count/route.ts`, `.../publish-progress/route.ts` ✅ – Move to session-aware DB + membership checks (skip when impersonating per higher-level callers).
- `app/src/app/api/sc/endorsements/*` ✅ – All four routes now use `withImpersonation`, `isTop100Delegate(addresses, db)` and share D1 context.
- `app/src/app/api/upload/route.ts` ✅ – Auth now based on impersonated userId.
- `app/src/app/api/world/verify/route.ts` ⚠️ – Still calls `verifyCloudProof`/`upsertUserWorldId` even while impersonating; block impersonation sessions or force `forceProd` with explicit “mocked” response.
- `app/src/app/api/test-auth/route.ts` ✅ – Removed test route.

### App Pages
- `app/src/app/application/page.tsx`, `application/5/page.tsx`, `application/6/page.tsx` ✅ – Use `withImpersonation` and fetch D1-aware lists; no side effects.
- `app/src/app/citizenship/components/ChainAppRequirements.tsx` ✅ – Client widget gains read-only state; leverages new read-only requirement view.
- `app/src/app/citizenship/components/UserRequirements.tsx` ✅ – Splits into interactive vs read-only; impersonation hides CTA.
- `app/src/app/citizenship/page.tsx` ✅ – Passes `db` into `getUserById` and respects impersonation when tracking interactions.
- `app/src/app/dashboard/page.tsx` ⚠️ – Calls `getUserById(userId, undefined, session)` on line 31, so impersonated sessions still hit production; pass `db` from `withImpersonation`.
- `app/src/app/governance/page.tsx` ⚠️ – Lines 16-21 require an authenticated user, breaking public governance browsing.
- `app/src/app/governance/roles/...` (all six files touched) ✅ – Components and pages now derive `viewerId` / fetch through `withImpersonation`; analytics trackers also log `actingAdminId`.
- `app/src/app/grant-eligibility/[formId]/page.tsx` ✅ – Membership checks skipped in impersonation mode; loads via `withImpersonation`.
- `app/src/app/missions/[id]/application/page.tsx` ✅ – Runs on impersonated user id.
- `app/src/app/missions/page.tsx` ⚠️ – Redirects unauthenticated visitors (line 23); confirm whether missions list should stay public.
- `app/src/app/profile/*` (ProfileSidebar, connected-apps, details, organizations pages, verified-addresses flow) ✅ – All server components now use `withImpersonation` and pass `db/session`. Connected-apps surfaces read-only messaging.
- `app/src/app/profile/verified-addresses/actions.ts`, `.../content.tsx`, `.../page.tsx` ✅ – Actions now rely on `withImpersonation`; the content component swaps to a read-only listing when `impersonationMode` is true.
- `app/src/app/project/[projectId]/page.tsx` ⚠️ – Lines 48-52 force login before showing project details; revert to public view while still deriving `viewerId` when available.
- `app/src/app/projects/[projectId]/*` (contracts, contributors, details, grant-address, grants, publish, repos, rewards, components toast) ✅ – Use `withImpersonation`, skip membership gating while impersonating, and call `*_WithClient` helpers.
- `app/src/app/projects/new/page.tsx` ✅ – Now respects impersonation.
- `app/src/app/rounds/page.tsx` ⚠️ – Similar to governance/mission pages: redirects visitors without a session (lines 17-24). Confirm intent.
- `app/src/app/application/5/6` etc – already noted.

### Components & Dialogs
- `app/src/components/application/ApplicationSubmitted.tsx` ✅ – Displays impersonated email for confirmation message.
- `app/src/components/common/Account.tsx` ✅ – Most logic now uses `viewerId`/`actingAdminId` and blocks Privy login flows while impersonating.
- `app/src/components/common/Navbar.tsx` ✅ – Adds impersonation banner offset and admin button.
- `app/src/components/dashboard/index.tsx` ✅ – Hides profile callout while impersonating.
- Dialogs (`AddGrantDeliveryAddressDialog.tsx`, `CitizenshipApplicationDialog.tsx`, `EditProfileDialog.tsx`, `GovernanceAddressDialog.tsx`, `ImportFromFarcasterDialog.tsx`, `SelectKYCProjectDialog.tsx`) ✅ – All now derive `viewerId`; governance dialog swaps CTA for read-only state.
- `app/src/components/icons/remix.tsx` ⚠️ – `Question` icon lacks a `fill` attribute (line 37-39) so color props are ignored; wrap `fill={fill}` in the `<path>` attributes.
- Mission components (`ApplicationSubmitted.tsx`, `MissionApplication.tsx`, `MissionApplicationTabs.tsx`, `UserRoundApplicationStatusCard.tsx`) ✅ – Track impersonation states.
- Profile components (`CompleteProfileCallout.tsx`, `DiscordConnection.tsx`, `EmailConnection.tsx`, `FarcasterConnection.tsx`, `GithubConnection.tsx`, `GithubDisplay.tsx`, `GovForumConnection.tsx`, `Public/ProfileHeader.tsx`) ⚠️ for the connection widgets – read-only variants still read `privyUser` (lines noted above) and can leak admin accounts; rely solely on server-fetched user data while impersonating. Other profile widgets behave correctly.
- `app/src/components/projects/ProjectSidebar.tsx`, `.../grants/.../KYCStatusContainer.tsx`, `.../rewards/DeleteKYCTeamDialog.tsx` ✅ – Fetch via `withSessionDb` and invalidate react-query caches after deletions (dialog now pushes reload query params to reflect new state).
- Proposal components (`VotingSidebar.tsx`, `VotingColumn.tsx`, `ProposalCard.tsx`) ✅ – Track `viewerId` for analytics and CTA logic.
- `app/src/components/rounds/Rounds.tsx` ✅ – Feedback button gating now keyed off impersonated viewer.

### Database Layer
- `app/src/db/apiUser.ts`, `category.ts`, `citizens.ts`, `endorsements.ts`, `githubProxomity.ts`, `grantEligibility.ts`, `kyc.ts`, `rewards.ts`, `role.ts`, `userKyc.ts`, `votes.ts` ✅ – Each now accepts optional `PrismaClient` and is session-aware.
- `app/src/db/organizations.ts` ⚠️ – `getUserOrganizationsWithDetailsFn` (lines 197-349) still hardcodes `prisma`; pass the provided `db` argument so impersonated reads stay on D1.
- `app/src/db/projects.ts` ⚠️ – Remaining `prisma` usages (lines ~1491-2993) mean certain contract/reward helpers still hit production even when caller provides `db`; replace with `db`.
- `app/src/db/users.ts` ⚠️ – Functions such as `createUser`(1078), `deleteUserEmails`(337), email upserts (341-402), passport/tag helpers (921-997), and user creation still use global Prisma. Update to honor the optional `db` parameter.

### Hooks
- `app/src/hooks/citizen/useUserCitizen.ts`, `app/src/hooks/db/use*` (AdminProjects, ExpiredKYCCount, GetRandomProjects, GithubProximity, KYCProject, Organization, OrganizationKycTeam, Project, ProjectContracts, ProjectDetails, UseUser, UserAdminProjects, UserApplications, UserPassports, UserProjects, UserRoundApplications, UserWorldId) ✅ – All now call server actions (`fetch*`) instead of importing Prisma directly. Ensure server actions are not overused client-side (consider caching/perf testing).
- `app/src/hooks/privy/usePrivyFarcaster.ts`, `usePrivyLinkEmail.ts` ✅ – Guard against impersonation and unavailable Privy contexts.
- `app/src/hooks/useProjectContracts.tsx`, `useWallet.ts`, `hooks/voting/*` ✅ – Adjust to viewer/admin separation.

### Server Actions & Business Logic
- `app/src/lib/actions/addresses.ts`, `applications.ts`, `citizens.ts`, `contracts.ts`, `emails.ts`, `grantEligibility.ts`, `kyc.ts`, `organizations.ts`, `persona.ts`, `projects.ts`, `proposals.ts`, `repos.ts`, `results.ts`, `rewards.ts`, `role.ts`, `snapshots.ts`, `tags.ts`, `userKyc.ts`, `users.ts`, `utils.ts` ✅ overall – Each now wraps work in `withSessionDb`. Notable exceptions:
  - `app/src/lib/actions/userKyc.ts:410-449` ⚠️ still uses `auth()`/production Prisma. Port this helper to `withSessionDb`.
  - `app/src/lib/actions/users.ts:233-276` ⚠️ hits the Passport API during impersonation; guard with `isInImpersonationMode()` or `withImpersonationProtection`.
- `app/src/lib/actions/emails.ts` ✅ – `sendTransactionEmail` now returns mock responses while impersonating; DB tracking updated to accept `db`.
- `app/src/lib/actions/persona.ts` ⚠️ – Still updates Persona reference IDs and emits inquiry URLs during impersonation; wrap these flows in `withImpersonationProtection`.
- `app/src/lib/actions/grantEligibility.ts`, `s8CitizenshipQualification` ✅ – heavy logic executes with session-aware db.
- `app/src/lib/actions/hookFetchers.ts` ⚠️ – Server actions are usable from client hooks, but there is no error handling for impersonation-specific failures; consider adding try/catch at call sites.

### Providers & Global Infrastructure
- `app/src/auth.ts` ✅ – Session/JWT callbacks now carry signed impersonation metadata, invalidated on expiry.
- `app/src/serverAuth.ts` ✅ – API key authentication now forces production DB even if admin is impersonating.
- `app/src/providers/AnalyticsProvider.tsx`, `PosthogProvider.tsx`, `LayoutProvider.tsx` ✅ – Analytics now log both viewer and acting admin; Layout injects banner space.

### Miscellaneous
- `app/src/lib/proposals.ts` ✅ – Accepts optional `db` for citizen lookups.
- `app/src/lib/services/top100.ts` ✅ – Accepts `db`; minor path change to `../../db/client` is acceptable but align with alias for clarity.
- `app/src/lib/utils/changelog.ts` ✅ – Transactions now rely on `withImpersonation` to fetch userId and use the caller’s Prisma client.
- `app/src/components/projects/[projectId]/components/UnsavedChangesToast.Server.tsx` ✅ – Uses `withSessionDb`.
- `app/src/lib/hooks.ts` ✅ – `useIsAdmin`/`useIsOrganizationAdmin` now resolve `viewerId` so impersonated admins see target-specific roles.

## Recommendations / Next Steps
1. Restore anonymous access where expected (project detail, governance, rounds, missions) while still deriving `viewerId` when authenticated.
2. Replace all lingering `prisma.*` usages with the provided `db` (users/projects/organizations modules and `dashboard/page.tsx`).
3. Introduce impersonation guards/mocks for all external services (World ID verification, Passport score refresh, Persona). Leverage the existing but unused `withImpersonationProtection` helper.
4. Persist impersonation audit events (new table) so the console log TODO is closed.
5. Update read-only connection components to rely exclusively on the impersonated user’s persisted data; never display `usePrivy()` state while impersonating.
6. Finish migrating residual direct-`auth()` helpers (e.g., `linkExistingKYCForEmail`) to `withSessionDb` so D1 reads/writes stay contained.
7. Fix the `Question` icon to honor the `fill` prop.
8. Consider surfacing a single source of truth for mocking (wrap Persona/World ID/Passport operations via `withImpersonationProtection`).
