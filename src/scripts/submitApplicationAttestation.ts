import { PrismaClient } from "@prisma/client"

import { publishAndSaveApplication } from "../lib/actions/applications"

const prisma = new PrismaClient()

async function submitApplicationAttestation() {
  // pull the projects with missing attestations
  const projectsWithMissingAttestations = (await prisma.$queryRawUnsafe(
    `
    WITH latest_snapshots AS (
      SELECT DISTINCT(p1."projectId") as "projectId", ps."createdAt", ps."attestationId"
      FROM "ProjectSnapshot" p1
      LEFT JOIN LATERAL (
        SELECT *
        FROM "ProjectSnapshot" p2
        WHERE p1."projectId" = p2."projectId"
        ORDER BY "createdAt" DESC
        LIMIT 1
      ) ps ON TRUE
    )
    SELECT 
      p.*,
      fid."farcasterId"  
    FROM (
      SELECT ps."projectId", ps."attestationId"
      FROM latest_snapshots ps
      LEFT JOIN LATERAL (
        SELECT * FROM  "Application" WHERE ps."projectId" = "projectId"
        ORDER BY "createdAt" DESC
        LIMIT 1) a ON TRUE
      WHERE ps."createdAt" > a."createdAt"
    ) p
    LEFT JOIN LATERAL (SELECT "farcasterId", up."projectId" FROM (
      SELECT "userId", "projectId"
      FROM "UserProjects"
      WHERE "projectId" = p."projectId"
      AND role = 'admin'
      ) up
    LEFT JOIN "User" u ON up."userId" = u.id
    ) fid ON fid."projectId" = p."projectId"
    `,
  )) as {
    projectId: string
    attestationId: string
    farcasterId: string
  }[]

  // for each project reattest the application
  for await (const project of projectsWithMissingAttestations) {
    const { projectId, attestationId, farcasterId } = project

    console.log(
      `Re-attesting application for project ${projectId} with snapshot ${attestationId}`,
    )

    // re-attest the application
    // Publish attestation
    const application = await publishAndSaveApplication({
      projectId,
      farcasterId,
      metadataSnapshotId: attestationId,
    })

    console.log(
      `Re-attested application for project ${projectId} with attestation ${application.id}`,
    )
  }
}

submitApplicationAttestation()
