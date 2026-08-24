#!/usr/bin/env bash
# Atlas deprecation backup: every public table as CSV, curated joins answering
# OP's data request, and a restorable pg_dump. Read-only against DATABASE_URL.
#
#   cd app && bash src/scripts/atlas-export.sh
#   BUCKET=atlas-deprecation-export bash src/scripts/atlas-export.sh   # also uploads
set -euo pipefail
cd "$(dirname "$0")/../.."

set -a; . ./.env; set +a
DB="${DATABASE_URL%%\?*}"
OUT="$PWD/output/atlas-export/$(date +%F)"
mkdir -p "$OUT/tables" "$OUT/curated" "$OUT/retool-kyc-v2"

dump() {
  psql "$DB" -v ON_ERROR_STOP=1 -qc "COPY ($(cat)) TO STDOUT WITH CSV HEADER" > "$OUT/curated/$1.csv"
  echo "curated/$1.csv: $(($(wc -l < "$OUT/curated/$1.csv") - 1)) rows"
}

echo "== raw tables -> $OUT/tables"
for t in $(psql "$DB" -Atc "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1"); do
  psql "$DB" -v ON_ERROR_STOP=1 -qc "\\copy \"$t\" TO '$OUT/tables/$t.csv' CSV HEADER"
done
echo "$(ls "$OUT/tables" | wc -l) tables"

echo "== curated -> $OUT/curated"

dump users <<'SQL'
SELECT u.id, u.username, u.name, u.bio, u.github, u.discord, u.twitter, u."farcasterId",
       u."govForumProfileUrl", u."privyDid", u."notDeveloper", u."emailNotifEnabled",
       (SELECT string_agg(ue.email || CASE WHEN ue.verified THEN '' ELSE ' (unverified)' END, '; ' ORDER BY ue."createdAt")
          FROM "UserEmail" ue WHERE ue."userId" = u.id)                                   AS emails,
       (SELECT string_agg(ua.address, '; ' ORDER BY ua."primary" DESC, ua."createdAt")
          FROM "UserAddress" ua WHERE ua."userId" = u.id)                                 AS addresses,
       (SELECT ua.address FROM "UserAddress" ua WHERE ua."userId" = u.id AND ua."primary" LIMIT 1) AS primary_address,
       u."createdAt", u."updatedAt"
FROM "User" u
WHERE u."deletedAt" IS NULL
ORDER BY u."createdAt"
SQL

dump user_emails <<'SQL'
SELECT ue."userId" AS user_id, u.username, ue.email, ue.verified, ue."createdAt"
FROM "UserEmail" ue
JOIN "User" u ON u.id = ue."userId" AND u."deletedAt" IS NULL
ORDER BY ue."createdAt"
SQL

dump user_addresses <<'SQL'
SELECT ua."userId" AS user_id, u.username, ua.address, ua.source, ua."primary", ua."createdAt"
FROM "UserAddress" ua
JOIN "User" u ON u.id = ua."userId" AND u."deletedAt" IS NULL
ORDER BY ua."createdAt"
SQL

dump projects <<'SQL'
SELECT p.id, p.name, p.description, p.category,
       array_to_string(p.website, '; ')      AS website,
       p.twitter,
       array_to_string(p.farcaster, '; ')    AS farcaster,
       p.mirror, p."openSourceObserverSlug",
       array_to_string(p."defiLlamaSlug", '; ') AS defillama_slug,
       p."pricingModel", p."pricingModelDetails", p."thumbnailUrl", p."bannerUrl",
       o.id AS organization_id, o.name AS organization_name,
       kt."walletAddress" AS kyc_wallet,
       p."createdAt", p."updatedAt"
FROM "Project" p
LEFT JOIN "ProjectOrganization" po ON po."projectId" = p.id AND po."deletedAt" IS NULL
LEFT JOIN "Organization" o         ON o.id = po."organizationId" AND o."deletedAt" IS NULL
LEFT JOIN "KYCTeam" kt             ON kt.id = p."kycTeamId"
WHERE p."deletedAt" IS NULL
ORDER BY p."createdAt"
SQL

dump project_members <<'SQL'
SELECT up."projectId" AS project_id, p.name AS project_name,
       up."userId" AS user_id, u.username, u.name, up.role,
       (SELECT string_agg(ue.email, '; ') FROM "UserEmail" ue WHERE ue."userId" = u.id) AS emails,
       up."createdAt"
FROM "UserProjects" up
JOIN "Project" p ON p.id = up."projectId" AND p."deletedAt" IS NULL
JOIN "User" u    ON u.id = up."userId"    AND u."deletedAt" IS NULL
WHERE up."deletedAt" IS NULL
ORDER BY p.name, up.role, u.username
SQL

for child in ProjectContract ProjectRepository ProjectLinks ProjectFunding; do
  name=$(echo "$child" | sed 's/Project/project_/' | tr '[:upper:]' '[:lower:]')
  dump "$name" <<SQL
SELECT p.name AS project_name, x.*
FROM "$child" x
JOIN "Project" p ON p.id = x."projectId" AND p."deletedAt" IS NULL
ORDER BY p.name, x."createdAt"
SQL
done

dump applications <<'SQL'
SELECT a."projectId" AS project_id, p.name AS project_name, p."deletedAt" AS project_deleted_at,
       a."roundId" AS round_id, r.name AS round_name,
       a.status, a."categoryId", a."attestationId", a."createdAt"
FROM "Application" a
JOIN "Project" p      ON p.id = a."projectId"
JOIN "FundingRound" r ON r.id = a."roundId"
ORDER BY a."createdAt"
SQL

dump organizations <<'SQL'
SELECT o.id, o.name, o.description,
       array_to_string(o.website, '; ')   AS website,
       o.twitter,
       array_to_string(o.farcaster, '; ') AS farcaster,
       o.mirror, o."avatarUrl",
       (SELECT string_agg(p.name, '; ' ORDER BY p.name)
          FROM "ProjectOrganization" po
          JOIN "Project" p ON p.id = po."projectId" AND p."deletedAt" IS NULL
         WHERE po."organizationId" = o.id AND po."deletedAt" IS NULL)        AS projects,
       (SELECT string_agg(kt."walletAddress", '; ')
          FROM "OrganizationKYCTeam" okt
          JOIN "KYCTeam" kt ON kt.id = okt."kycTeamId" AND kt."deletedAt" IS NULL
         WHERE okt."organizationId" = o.id AND okt."deletedAt" IS NULL)      AS kyc_wallets,
       o."createdAt", o."updatedAt"
FROM "Organization" o
WHERE o."deletedAt" IS NULL
ORDER BY o."createdAt"
SQL

dump organization_members <<'SQL'
SELECT uo."organizationId" AS organization_id, o.name AS organization_name,
       uo."userId" AS user_id, u.username, u.name, uo.role,
       (SELECT string_agg(ue.email, '; ') FROM "UserEmail" ue WHERE ue."userId" = u.id) AS emails,
       uo."createdAt"
FROM "UserOrganization" uo
JOIN "Organization" o ON o.id = uo."organizationId" AND o."deletedAt" IS NULL
JOIN "User" u         ON u.id = uo."userId"         AND u."deletedAt" IS NULL
WHERE uo."deletedAt" IS NULL
ORDER BY o.name, uo.role, u.username
SQL

dump kyc_users <<'SQL'
SELECT ku.id, ku.email, ku."firstName", ku."lastName", ku.status, ku."personaStatus", ku.expiry,
       ku."personaInquiryId", ku."personaReferenceId", ku."inquiryCreatedAt",
       (SELECT string_agg(u.id, '; ')       FROM "UserKYCUser" uku JOIN "User" u ON u.id = uku."userId" WHERE uku."kycUserId" = ku.id) AS atlas_user_ids,
       (SELECT string_agg(u.username, '; ') FROM "UserKYCUser" uku JOIN "User" u ON u.id = uku."userId" WHERE uku."kycUserId" = ku.id) AS atlas_usernames,
       (SELECT string_agg(kt."walletAddress", '; ') FROM "KYCUserTeams" kut JOIN "KYCTeam" kt ON kt.id = kut."kycTeamId" WHERE kut."kycUserId" = ku.id) AS team_wallets,
       ku."createdAt", ku."updatedAt"
FROM "KYCUser" ku
ORDER BY ku."createdAt"
SQL

dump kyc_legal_entities <<'SQL'
SELECT le.id, le.name, le.status, le.expiry, le."personaInquiryId", le."personaReferenceId", le."inquiryCreatedAt",
       lec."firstName" AS controller_first_name, lec."lastName" AS controller_last_name, lec.email AS controller_email,
       (SELECT string_agg(kt."walletAddress", '; ') FROM "KYCLegalEntityTeams" lett JOIN "KYCTeam" kt ON kt.id = lett."kycTeamId" WHERE lett."legalEntityId" = le.id) AS team_wallets,
       le."createdAt", le."updatedAt"
FROM "KYCLegalEntity" le
LEFT JOIN "KYCLegalEntityController" lec ON lec.id = le."kycLegalEntityControllerId"
ORDER BY le."createdAt"
SQL

dump kyc_teams <<'SQL'
SELECT kt.id, kt."walletAddress", kt."createdAt", kt."deletedAt",
       (SELECT string_agg(p.name, '; ' ORDER BY p.name) FROM "Project" p
         WHERE p."kycTeamId" = kt.id AND p."deletedAt" IS NULL)                         AS projects,
       (SELECT string_agg(o.name, '; ' ORDER BY o.name) FROM "OrganizationKYCTeam" okt
          JOIN "Organization" o ON o.id = okt."organizationId" AND o."deletedAt" IS NULL
         WHERE okt."kycTeamId" = kt.id AND okt."deletedAt" IS NULL)                     AS organizations,
       STRING_AGG(DISTINCT CONCAT_WS(' ', ku."firstName", ku."lastName"), '; ') FILTER (WHERE ku.id IS NOT NULL) AS individual_names,
       STRING_AGG(DISTINCT ku.email, '; ')        FILTER (WHERE ku.email IS NOT NULL)   AS individual_emails,
       STRING_AGG(DISTINCT ku.status::text, '; ') FILTER (WHERE ku.status IS NOT NULL)  AS individual_statuses,
       STRING_AGG(DISTINCT le.name, '; ')         FILTER (WHERE le.id IS NOT NULL)      AS entity_names,
       STRING_AGG(DISTINCT le.status::text, '; ') FILTER (WHERE le.status IS NOT NULL)  AS entity_statuses,
       STRING_AGG(DISTINCT lec.email, '; ')       FILTER (WHERE lec.email IS NOT NULL)  AS entity_controller_emails,
       CASE
         WHEN kt."deletedAt" IS NOT NULL                                                  THEN 'KYC Team Deleted'
         WHEN COUNT(DISTINCT ku.id) FILTER (WHERE ku.status = 'REJECTED') > 0
           OR COUNT(DISTINCT le.id) FILTER (WHERE le.status = 'REJECTED') > 0            THEN 'KYC Rejected'
         WHEN COUNT(DISTINCT ku.id) FILTER (WHERE ku.status = 'APPROVED' AND ku.expiry < NOW()) > 0
           OR COUNT(DISTINCT le.id) FILTER (WHERE le.status = 'APPROVED' AND le.expiry < NOW()) > 0
                                                                                          THEN 'KYC Expired'
         WHEN COUNT(DISTINCT ku.id) FILTER (WHERE ku.status IN ('PENDING','PENDING_REVIEW')) > 0
           OR COUNT(DISTINCT le.id) FILTER (WHERE le.status IN ('PENDING','PENDING_REVIEW')) > 0
                                                                                          THEN 'KYC Pending'
         WHEN COUNT(DISTINCT ku.id) FILTER (WHERE ku.status = 'APPROVED' AND ku.expiry >= NOW()) > 0
           OR COUNT(DISTINCT le.id) FILTER (WHERE le.status = 'APPROVED' AND (le.expiry IS NULL OR le.expiry >= NOW())) > 0
                                                                                          THEN 'KYC Approved'
         ELSE 'No KYC Submitted'
       END                                                                                AS kyc_status,
       LEAST(MIN(ku.expiry) FILTER (WHERE ku.status = 'APPROVED'),
             MIN(le.expiry) FILTER (WHERE le.status = 'APPROVED'))                        AS earliest_expiry
FROM "KYCTeam" kt
LEFT JOIN "KYCUserTeams" kut             ON kut."kycTeamId" = kt.id
LEFT JOIN "KYCUser" ku                   ON ku.id = kut."kycUserId"
LEFT JOIN "KYCLegalEntityTeams" lett     ON lett."kycTeamId" = kt.id
LEFT JOIN "KYCLegalEntity" le            ON le.id = lett."legalEntityId"
LEFT JOIN "KYCLegalEntityController" lec ON lec.id = le."kycLegalEntityControllerId"
GROUP BY kt.id
ORDER BY kt."createdAt"
SQL

dump grant_eligibility <<'SQL'
SELECT ge.id, ge."grantType", ge."currentStep", ge."submittedAt", ge."expiresAt", ge."walletAddress",
       ge."projectId" AS project_id, p.name AS project_name,
       ge."organizationId" AS organization_id, o.name AS organization_name,
       ge."kycTeamId" AS kyc_team_id,
       ge.data::text AS data, ge.attestations::text AS attestations,
       ge."createdAt", ge."updatedAt", ge."deletedAt"
FROM "GrantEligibility" ge
LEFT JOIN "Project" p      ON p.id = ge."projectId"
LEFT JOIN "Organization" o ON o.id = ge."organizationId"
ORDER BY ge."createdAt"
SQL

dump email_list <<'SQL'
SELECT ue.email, ue.verified, u.id AS user_id, u.username, u.name, u."emailNotifEnabled" AS email_notif_enabled,
       EXISTS (SELECT 1 FROM "UserProjects" up JOIN "Project" p ON p.id = up."projectId" AND p."deletedAt" IS NULL
                WHERE up."userId" = u.id AND up."deletedAt" IS NULL AND up.role = 'admin')   AS is_project_admin,
       EXISTS (SELECT 1 FROM "UserProjects" up JOIN "Project" p ON p.id = up."projectId" AND p."deletedAt" IS NULL
                WHERE up."userId" = u.id AND up."deletedAt" IS NULL)                         AS is_project_member,
       EXISTS (SELECT 1 FROM "UserOrganization" uo JOIN "Organization" o ON o.id = uo."organizationId" AND o."deletedAt" IS NULL
                WHERE uo."userId" = u.id AND uo."deletedAt" IS NULL)                         AS is_org_member,
       EXISTS (SELECT 1 FROM "Citizen" c WHERE c."userId" = u.id)                            AS is_citizen,
       EXISTS (SELECT 1 FROM "UserKYCUser" uku WHERE uku."userId" = u.id)                    AS has_kyc,
       u."createdAt" AS joined_at
FROM "UserEmail" ue
JOIN "User" u ON u.id = ue."userId" AND u."deletedAt" IS NULL
WHERE ue.email <> ''
ORDER BY ue.email
SQL

echo "== pg_dump -> $OUT/atlas-prod.dump"
pg_dump -Fc --no-owner --no-privileges --schema=public "$DB" > "$OUT/atlas-prod.dump"
ls -lh "$OUT/atlas-prod.dump"

cat > "$OUT/README.md" <<EOF
# Atlas data export — $(date +%F)

Snapshot of the Atlas production database (public schema) taken $(date -u +'%Y-%m-%d %H:%M UTC').

## Folders

- \`tables/\` — every table in the database, one CSV per table, raw (column names = Prisma schema). Includes soft-deleted rows (\`deletedAt\` set), API keys (\`api_users\`) and email verification tokens — treat as sensitive.
- \`curated/\` — joined, human-readable views answering the deprecation data request (see legend below). Soft-deleted users/projects/orgs are excluded; list-valued columns are \`; \`-separated.
- \`retool-kyc-v2/\` — CSV download of each tab of the "KYC v2" Retool board, as displayed.
- \`atlas-prod.dump\` — full PostgreSQL custom-format dump (\`pg_restore -d <db> atlas-prod.dump\`), public schema only.

## Curated legend

| file | one row per | notes |
|---|---|---|
| users | Atlas user | profile fields + all emails (unverified ones flagged) + all wallet addresses |
| user_emails / user_addresses | email / wallet | normalized versions of the above |
| email_list | email | mailing-list extract: verified flag, notification opt-in, and role flags (project admin/member, org member, citizen, has KYC) |
| projects | project | profile + organization + KYC wallet |
| project_members | project × user | role + member emails |
| project_contracts / project_repositories / project_links / project_funding | row | user-provided project details |
| applications | project × funding round | application status per round |
| organizations | organization | profile + project names + KYC wallets |
| organization_members | organization × user | role + member emails |
| kyc_users | KYC individual | Persona status/expiry, linked Atlas users, team wallets |
| kyc_legal_entities | KYB entity | status/expiry, controller contact, team wallets |
| kyc_teams | KYC team (grant wallet) | projects/orgs attached, aggregated individual + entity statuses, derived \`kyc_status\` |
| grant_eligibility | grant eligibility form | raw form payload in \`data\` (JSON) |
EOF

echo "== done: $OUT"
du -sh "$OUT"

if [ -n "${BUCKET:-}" ]; then
  gcloud storage cp -r "$OUT" "gs://$BUCKET/"
fi
