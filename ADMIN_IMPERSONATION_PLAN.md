# Admin Impersonation Implementation Plan

## 📋 Executive Summary

**Goal:** Allow hardcoded admin wallets to impersonate any user using a d-1 (day-old) production snapshot, with full action capabilities while preventing real-world side effects.

**Architecture:** Single app deployment, dual Prisma clients, session-based routing, external service mocking.

**Infrastructure:**
- ✅ D-1 PostgreSQL database (daily snapshot of production) - CONFIGURED
- ✅ Cloud Function for daily refresh (GCP) - CONFIGURED
- ✅ Cloud Scheduler for automation - CONFIGURED

---

## 🏗️ Implementation Phases

### ✅ Phase 0: Prerequisites & Infrastructure Setup (COMPLETE)

**Status:** ✅ Done
- D-1 database instance created
- Cloud Function deployed for daily refresh
- Cloud Scheduler configured (runs at 2 AM daily)
- `D1_DATABASE_URL` added to environment variables

---

### Phase 1: Admin Configuration System

#### Files to Create:

**1.1 `app/src/lib/auth/adminWallets.ts`** (NEW)
```typescript
/**
 * Admin Wallet List
 * Hardcoded list of wallet addresses authorized for admin impersonation
 *
 * To add/remove admins, update this file and deploy
 */

export const ADMIN_WALLETS = [
  '0x1234567890123456789012345678901234567890', // Example admin 1
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', // Example admin 2
  // Add more admin wallets here
].map(addr => addr.toLowerCase())
```

**1.2 `app/src/lib/auth/adminConfig.ts`** (NEW)
```typescript
/**
 * Admin Configuration
 * Manages admin authorization and impersonation feature flags
 */

import { ADMIN_WALLETS } from './adminWallets'

const IMPERSONATION_ENABLED = process.env.ENABLE_ADMIN_IMPERSONATION === 'true'

export function isImpersonationEnabled(): boolean {
  return IMPERSONATION_ENABLED && ADMIN_WALLETS.length > 0
}

export function isAdminWallet(address: string): boolean {
  if (!isImpersonationEnabled()) return false
  return ADMIN_WALLETS.includes(address.toLowerCase())
}

export async function isAdminUser(userId: string): Promise<boolean> {
  if (!isImpersonationEnabled()) return false

  const { prisma } = await import('@/db/client')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true }
  })

  if (!user) return false

  return user.addresses.some(addr => isAdminWallet(addr.address))
}

export function getAdminWallets(): string[] {
  return ADMIN_WALLETS
}

export async function getAdminInfo(userId: string) {
  const { prisma } = await import('@/db/client')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true }
  })

  if (!user) return null

  const adminAddress = user.addresses.find(addr => isAdminWallet(addr.address))

  return {
    userId: user.id,
    name: user.name,
    username: user.username,
    adminAddress: adminAddress?.address,
    isAdmin: !!adminAddress
  }
}
```

**Testing Checklist:**
- [ ] `isImpersonationEnabled()` returns false when env var not set
- [ ] `isAdminWallet()` correctly identifies admin addresses
- [ ] `isAdminUser()` works with user IDs
- [ ] Works with both checksummed and lowercase addresses
- [ ] Returns false when feature is disabled

---

### Phase 2: Database Client Routing

#### Files to Create:

**2.1 `app/src/db/adminClient.ts`** (NEW)

See full implementation in detailed section below.

**2.2 `app/src/lib/db/helpers.ts`** (NEW)

Helper functions for session-based database routing.

**Testing Checklist:**
- [ ] Both clients initialize successfully
- [ ] `getClient(false)` returns production client
- [ ] `getClient(true)` returns d-1 client or throws if not configured
- [ ] Connection pooling limits work as expected
- [ ] Metrics endpoint returns data from both databases

---

### Phase 3: Session Management & Authentication

**Modify:** `app/src/auth.ts`

Extend NextAuth session type with impersonation metadata.

**Testing Checklist:**
- [ ] Session type changes compile without errors
- [ ] Normal login flow works (no impersonation)
- [ ] Session update triggers work for impersonation changes
- [ ] JWT includes impersonation metadata

---

### Phase 4: Impersonation Service Layer

**Create:** `app/src/lib/services/impersonationService.ts`

Core business logic for impersonation lifecycle.

**Features:**
- User search (name, username, email, ID)
- Start impersonation
- Switch between users
- Stop impersonation
- Audit logging

**Testing Checklist:**
- [ ] User search returns correct results
- [ ] Start impersonation validates admin permissions
- [ ] Stop impersonation logs audit events
- [ ] Switch user updates session correctly
- [ ] Self-impersonation is blocked

---

### Phase 5: API Endpoints

**Files to Create:**
- `app/src/app/api/admin/impersonate/route.ts` - Start/stop/switch
- `app/src/app/api/admin/search-users/route.ts` - User search
- `app/src/app/api/admin/impersonation-status/route.ts` - Status check

**Testing Checklist:**
- [ ] POST /api/admin/impersonate validates admin permissions
- [ ] POST returns correct impersonation metadata
- [ ] DELETE stops impersonation successfully
- [ ] GET /api/admin/search-users returns search results
- [ ] API returns 403 for non-admin users
- [ ] API returns 503 when d-1 not configured

---

### Phase 6: External Service Mocking

**Critical:** This prevents real emails, KYC submissions, payments during testing.

**Files to Create:**
- `app/src/lib/impersonationContext.ts` - Detect impersonation mode

**Files to Modify:**
- `app/src/lib/actions/emails.ts` - Mock all email functions
- `app/src/lib/persona.ts` - Mock Persona API calls
- Any other external service integrations

**Pattern:**
```typescript
export const sendEmail = async (data) => {
  if (await isInImpersonationMode()) {
    console.log('🎭 MOCKED: Email send', data)
    return { success: true, mocked: true }
  }
  // Real email sending
}
```

**Testing Checklist:**
- [ ] Email sending is mocked during impersonation
- [ ] Persona API calls are mocked during impersonation
- [ ] Mock responses are logged to console
- [ ] Real operations work when not impersonating
- [ ] All external service calls are wrapped

---

### Phase 7: UI Components

**Files to Create:**
- `app/src/components/admin/ImpersonationBanner.tsx` - Top banner
- `app/src/components/admin/UserSearchAutocomplete.tsx` - Search UI
- `app/src/components/admin/AdminImpersonationButton.tsx` - Entry point

**Files to Modify:**
- `app/src/app/layout.tsx` - Add banner
- `app/src/components/common/Navbar.tsx` - Add admin button

**Testing Checklist:**
- [ ] Banner appears when impersonating
- [ ] Banner shows correct user name and info
- [ ] User search autocomplete works
- [ ] Switch user functionality works
- [ ] Stop impersonation returns to admin view
- [ ] Admin button only shows for admin wallets
- [ ] UI is responsive on mobile

---

### Phase 8: Update Server Actions & Components

**Pattern to apply across ~30-50 files:**

```typescript
// Before
export async function getUserProjects(userId: string) {
  return await prisma.project.findMany({
    where: { team: { some: { userId } } }
  })
}

// After
import { auth } from "@/auth"
import { getSessionDatabase, getEffectiveUserId } from "@/lib/db/helpers"

export async function getUserProjects() {
  const session = await auth()
  const db = getSessionDatabase(session)
  const userId = getEffectiveUserId(session)

  if (!userId) throw new Error('Unauthorized')

  return await db.project.findMany({
    where: { team: { some: { userId } } }
  })
}
```

**Find files to update:**
```bash
# Find direct prisma imports
grep -r "from.*@/db/client" app/src --include="*.ts" --include="*.tsx"

# Find prisma usage
grep -r "prisma\." app/src --include="*.ts" --include="*.tsx"
```

**Testing Checklist:**
- [ ] All server actions use session-based routing
- [ ] No direct `prisma` imports in user-facing actions
- [ ] All queries respect impersonation context
- [ ] Existing tests still pass
- **Status (2025-11-08):** Code refactor complete per `ADMIN_PHASE8_EXECUTION_PLAN.md §3.3`. Only intentional holdouts are one-off scripts and the core helper (`lib/db/helpers.ts`). Pending item is to run/record impersonation smoke tests before final sign-off.

---

### Phase 9: Testing & Quality Assurance

**Unit Tests:**
- Admin configuration
- Database helpers
- Impersonation service

**Integration Tests:**
- Playwright end-to-end scenarios
- External service mocking verification

**Manual Testing:**
- Full impersonation workflow
- All UI components
- Edge cases (errors, network issues, etc.)

---

## 🔑 Key Architectural Decisions

### 1. Admin Wallets in Code File (Not Env Var)
- Easier version control
- Simpler to review changes
- No need to redeploy infrastructure
- File: `app/src/lib/auth/adminWallets.ts`

### 2. Session-Based Database Routing
```typescript
const session = await auth()
const db = session?.impersonation?.isActive
  ? adminDb.getClient(true)   // D-1 database
  : prisma                     // Production database
```

### 3. External Service Mocking Strategy
All external APIs check `isInImpersonationMode()` before executing:
- Emails → Logged, not sent
- Persona KYC → Mock inquiry created
- Payments → Mock transaction
- Blockchain → Mock attestation

### 4. Cron Jobs Unaffected
Crons have NO session → Always use production database → No impersonation

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ User Request                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Has NextAuth Session?                                  │
│   NO (cron/webhook) → Production DB only               │
│   YES ↓                                                │
│                                                         │
│ Check session.impersonation.isActive                   │
│   NO → Production DB, actual user ID                   │
│   YES ↓                                                │
│                                                         │
│ Route to D-1 DB                                        │
│ Use targetUserId from impersonation                    │
│ Mock all external services                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

1. **Admin Authorization:** Checked per-request, not just session creation
2. **Database Isolation:** D-1 is separate instance, daily refreshed
3. **External Service Protection:** All APIs mocked during impersonation
4. **Audit Logging:** Every impersonation event logged
5. **Session Security:** Impersonation metadata in JWT, server-validated
6. **Connection Limits:** Proper pooling prevents DoS
7. **No Production Impact:** Crons and normal users completely unaffected

---

## 📝 Environment Variables

```bash
# Required
D1_DATABASE_URL="postgresql://user:pass@host/db?connection_limit=2"
ENABLE_ADMIN_IMPERSONATION="true"

# Production database (already configured)
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=3"
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] D-1 database instance created and accessible
- [ ] Daily refresh Cloud Function tested
- [ ] Admin wallets list populated
- [ ] Environment variables set in Vercel
- [ ] All tests passing

### Deployment Steps
1. Deploy to staging first
2. Test admin impersonation end-to-end
3. Verify d-1 data is current (within 24h)
4. Verify external services are mocked
5. Deploy to production
6. Monitor for errors

### Post-Deployment
- [ ] Verify admin users can access impersonation
- [ ] Verify non-admins cannot access
- [ ] Monitor Cloud SQL connection count
- [ ] Check d-1 refresh logs (next day)
- [ ] Set up alerts for refresh failures

---

## 📈 Monitoring

### Metrics to Track
1. **D-1 Refresh Success Rate:** Should be 100%
2. **Connection Pool Usage:** Should stay under 50% of limit
3. **Impersonation Sessions:** Track count and duration
4. **Mocked Operations:** Log all mocked external service calls

### Alerts
- D-1 refresh failure
- Connection pool > 80% utilization
- Impersonation session > 2 hours (potential forgotten session)

---

## 🛠️ Troubleshooting

### D-1 Database Not Available
**Symptom:** API returns "D-1 database not configured"
**Fix:**
1. Check `D1_DATABASE_URL` in environment variables
2. Verify d-1 instance is running
3. Check connection string format

### Users Not Found in Search
**Symptom:** Search returns empty results
**Fix:**
1. Verify d-1 database was refreshed recently
2. Check Cloud Function logs
3. Manually trigger refresh

### External Service Still Executing
**Symptom:** Real emails sent during impersonation
**Fix:**
1. Check `isInImpersonationMode()` is called
2. Verify session has impersonation metadata
3. Check function is wrapped with protection

---

## 📚 References

- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [NextAuth Session Management](https://next-auth.js.org/configuration/options#session)
- [GCP Cloud SQL Cloning](https://cloud.google.com/sql/docs/postgres/clone-instance)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

---

## ✅ Success Criteria

- [x] Infrastructure (d-1 database) operational
- [ ] Admin users can search and impersonate any user
- [ ] All queries route to d-1 database during impersonation
- [ ] External services (email, Persona, etc.) are mocked
- [ ] UI clearly shows impersonation state with prominent banner
- [ ] Cron jobs and webhooks unaffected (still use production)
- [ ] Normal users completely unaffected
- [ ] Zero production data modification during impersonation
- [ ] Complete audit trail of all impersonation events
- [ ] Connection pooling stays within limits
- [ ] Tests passing for all components

---

**Last Updated:** 2025-01-07
**Status:** Phase 0 Complete, Ready for Phase 1 Implementation
