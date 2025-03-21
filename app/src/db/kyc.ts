import { KYCUser } from "@prisma/client"

import { prisma } from "./client"

export async function updateKYCUserStatus(
  name: string,
  email: string,
  status: string,
  updatedAt: Date,
) {
  const result = await prisma.$queryRaw<KYCUser[]>`
    WITH closest_match AS (
      SELECT id, similarity("firstName" || ' ' || "lastName", ${name}) as name_similarity
      FROM "KYCUser" 
      WHERE "email" = ${email.toLowerCase()}
      ORDER BY name_similarity DESC
      LIMIT 1
    )
    INSERT INTO "KYCUser" ("email", "firstName", "lastName", "status", "updatedAt", "expiry")
    VALUES (
      gen_random_uuid(),
      ${email.toLowerCase()},
      ${name.split(" ")[0]}, 
      ${name.split(" ")[1]},
      ${status}::"KYCStatus",
      ${updatedAt},
      ${updatedAt} + INTERVAL '1 year'
    )
    ON CONFLICT (id) DO UPDATE SET
      "status" = ${status}::"KYCStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE EXISTS (
      SELECT 1 FROM closest_match 
      WHERE closest_match.id = "KYCUser".id
      AND closest_match.name_similarity > 0.7
    )
    RETURNING *;
  `

  return result
}

export async function updateKYBUserStatus(
  name: string,
  email: string,
  status: string,
  updatedAt: Date,
) {
  const result = await prisma.$queryRaw<KYCUser[]>`
    WITH closest_match AS (
      SELECT id, similarity("businessName", ${name}) as name_similarity
      FROM "KYCUser" 
      WHERE "email" = ${email.toLowerCase()}
      ORDER BY name_similarity DESC
      LIMIT 1
    )
    INSERT INTO "KYCUser" ("email", "businessName", "status", "updatedAt", "expiry") 
    VALUES (
      gen_random_uuid(),
      ${email.toLowerCase()},
      ${name},
      ${status}::"KYCStatus",
      ${updatedAt},
      ${updatedAt} + INTERVAL '1 year'
    )
    ON CONFLICT (id) DO UPDATE SET
      "status" = ${status}::"KYCStatus",
      "updatedAt" = ${updatedAt},
      "expiry" = ${updatedAt} + INTERVAL '1 year'
    WHERE EXISTS (
      SELECT 1 FROM closest_match 
      WHERE closest_match.id = "KYCUser".id
      AND closest_match.name_similarity > 0.8
    )
    RETURNING *;
  `

  return result
}
