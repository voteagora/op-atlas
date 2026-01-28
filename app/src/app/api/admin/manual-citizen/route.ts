/**
 * Manual Citizen Attestation API
 * POST /api/admin/manual-citizen - Create citizen attestation for hardcoded user
 *
 * This is a temporary endpoint to create a citizen attestation for a specific user.
 * Only allowed to be called by a specific wallet address.
 */

import { CitizenRegistrationStatus } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getAddress, verifyMessage } from "viem"

import { prisma } from "@/db/client"
import { getUserById } from "@/db/users"
import { CITIZEN_ATTESTATION_CODE, CITIZEN_TYPES } from "@/lib/constants"
import { createCitizenAttestation } from "@/lib/eas/serverOnly"
import { getActiveSeason } from "@/lib/seasons"

export const dynamic = "force-dynamic"

// Only this wallet can call the endpoint - TEMPORARY
const ALLOWED_CALLER = "0xbb8DBD9CC7ADA9f4E31D4BD8C7A0410f2333c81a"

// Message that must be signed by the caller's wallet
const SIGNATURE_MESSAGE =
  "I authorize creating a citizen attestation for op-atlas manual-citizen endpoint"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const {
      callerAddress,
      signature,
      targetUserId,
      targetAddress,
      targetProjectId,
      citizenType,
    } = body

    // Validate required fields
    if (!callerAddress) {
      return NextResponse.json(
        { error: "callerAddress is required in request body" },
        { status: 400 },
      )
    }

    if (!signature) {
      return NextResponse.json(
        {
          error: "signature is required in request body",
          message: `Please sign this message with your wallet: "${SIGNATURE_MESSAGE}"`,
        },
        { status: 400 },
      )
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required in request body" },
        { status: 400 },
      )
    }

    if (!targetAddress) {
      return NextResponse.json(
        { error: "targetAddress is required in request body" },
        { status: 400 },
      )
    }

    if (!citizenType || !Object.values(CITIZEN_TYPES).includes(citizenType)) {
      return NextResponse.json(
        {
          error: "citizenType is required and must be one of: user, chain, app",
          validTypes: Object.values(CITIZEN_TYPES),
        },
        { status: 400 },
      )
    }

    // For app/chain citizens, projectId/organizationId is required
    if (citizenType === CITIZEN_TYPES.app && !targetProjectId) {
      return NextResponse.json(
        { error: "targetProjectId is required for app citizen type" },
        { status: 400 },
      )
    }

    // Verify caller is allowed
    const checksummedCaller = getAddress(callerAddress)
    if (checksummedCaller.toLowerCase() !== ALLOWED_CALLER.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to call this endpoint" },
        { status: 403 },
      )
    }

    // Verify signature
    const isValidSignature = await verifyMessage({
      address: checksummedCaller as `0x${string}`,
      message: SIGNATURE_MESSAGE,
      signature: signature as `0x${string}`,
    })

    if (!isValidSignature) {
      return NextResponse.json(
        {
          error:
            "Invalid signature. Please sign the correct message with your wallet.",
        },
        { status: 401 },
      )
    }

    // Get active season
    const season = await getActiveSeason()
    if (!season) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 400 },
      )
    }

    console.log("[Manual Citizen] Starting attestation creation", {
      seasonId: season.id,
      userId: targetUserId,
      address: targetAddress,
      projectId: targetProjectId,
      citizenType,
    })

    // Get user
    const user = await getUserById(targetUserId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already has attestation for this season
    const existingCitizenSeason = await prisma.citizenSeason.findFirst({
      where: {
        seasonId: season.id,
        userId: targetUserId,
        attestationId: { not: null },
        registrationStatus: CitizenRegistrationStatus.ATTESTED,
      },
    })

    if (existingCitizenSeason?.attestationId) {
      return NextResponse.json({
        success: true,
        message: "User already has attestation for this season",
        attestationId: existingCitizenSeason.attestationId,
        alreadyExists: true,
      })
    }

    // Checksum the target address
    const checksummedAddress = getAddress(targetAddress)

    // Create the attestation
    console.log("[Manual Citizen] Creating attestation...")
    const attestationId = await createCitizenAttestation({
      to: checksummedAddress,
      farcasterId: parseInt(user.farcasterId || "0"),
      selectionMethod:
        CITIZEN_ATTESTATION_CODE[citizenType as keyof typeof CITIZEN_TYPES],
      refUID: citizenType === CITIZEN_TYPES.user ? undefined : targetProjectId,
    })

    console.log("[Manual Citizen] Attestation created:", attestationId)

    // Validate attestation ID format
    const isValidAttestationId = /^0x[a-fA-F0-9]{64}$/.test(attestationId)
    if (!isValidAttestationId) {
      return NextResponse.json(
        { error: "Invalid attestation ID format", attestationId },
        { status: 500 },
      )
    }

    // Update database in transaction
    await prisma.$transaction(async (tx) => {
      // Create CitizenSeason record
      await tx.citizenSeason.create({
        data: {
          seasonId: season.id,
          userId: targetUserId,
          projectId:
            citizenType === CITIZEN_TYPES.user ? null : targetProjectId,
          governanceAddress: checksummedAddress,
          registrationStatus: CitizenRegistrationStatus.ATTESTED,
          attestationId,
        },
      })

      // Upsert to legacy Citizen table for voting system compatibility
      await tx.citizen.upsert({
        where: {
          userId: targetUserId,
        },
        update: {
          address: checksummedAddress,
          attestationId,
          type: citizenType,
          projectId:
            citizenType === CITIZEN_TYPES.user ? null : targetProjectId,
          organizationId: null,
        },
        create: {
          userId: targetUserId,
          address: checksummedAddress,
          attestationId,
          type: citizenType,
          projectId:
            citizenType === CITIZEN_TYPES.user ? null : targetProjectId,
          organizationId: null,
        },
      })
    })

    console.log("[Manual Citizen] Database updated successfully")

    return NextResponse.json({
      success: true,
      message: "Citizen attestation created successfully",
      attestationId,
      seasonId: season.id,
      userId: targetUserId,
      address: checksummedAddress,
      projectId: targetProjectId || null,
      citizenType,
    })
  } catch (error) {
    console.error("[Manual Citizen] Error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create citizen attestation",
        details: "Check server logs for details.",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check status for a specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callerAddress = searchParams.get("callerAddress")
    const userId = searchParams.get("userId")

    if (!callerAddress) {
      return NextResponse.json(
        { error: "callerAddress query param is required" },
        { status: 400 },
      )
    }

    // Verify caller is allowed
    const checksummedCaller = getAddress(callerAddress)
    if (checksummedCaller.toLowerCase() !== ALLOWED_CALLER.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to call this endpoint" },
        { status: 403 },
      )
    }

    const season = await getActiveSeason()

    // If userId provided, check that specific user's status
    if (userId) {
      const existingCitizenSeason = await prisma.citizenSeason.findFirst({
        where: {
          seasonId: season?.id,
          userId,
        },
      })

      const existingCitizen = await prisma.citizen.findUnique({
        where: { userId },
      })

      const user = await getUserById(userId)

      return NextResponse.json({
        allowedCaller: ALLOWED_CALLER,
        activeSeason: season ? { id: season.id, name: season.name } : null,
        user: user ? { id: user.id, farcasterId: user.farcasterId } : null,
        existingCitizenSeason,
        existingCitizen,
      })
    }

    // Otherwise just return general info
    return NextResponse.json({
      allowedCaller: ALLOWED_CALLER,
      activeSeason: season ? { id: season.id, name: season.name } : null,
      validCitizenTypes: Object.values(CITIZEN_TYPES),
      usage: {
        POST: {
          callerAddress: "Your wallet address (must match ALLOWED_CALLER)",
          signature: `Sign this message: "${SIGNATURE_MESSAGE}"`,
          targetUserId: "UUID of the user to create attestation for",
          targetAddress: "Ethereum address for the citizen",
          citizenType: "user | chain | app",
          targetProjectId: "Required for app type - the project attestation ID",
        },
      },
    })
  } catch (error) {
    console.error("[Manual Citizen] GET Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 },
    )
  }
}
