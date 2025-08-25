import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface CreateKYCUserParams {
  firstName: string
  lastName: string
  email: string
  businessName?: string
  status?: "PENDING" | "APPROVED" | "REJECTED"
}

async function createKYCUser({
  firstName,
  lastName,
  email,
  businessName,
  status = "PENDING",
}: CreateKYCUserParams) {
  try {
    // Check if KYC user already exists with this email
    const existingUser = await prisma.kYCUser.findFirst({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      console.log(`KYC user with email ${email} already exists`)
      console.log("Existing user:", {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        businessName: existingUser.businessName,
        status: existingUser.status,
        email: existingUser.email,
      })
      return existingUser
    }

    // Create new KYC user
    const newUser = await prisma.kYCUser.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        businessName,
        status,
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    })

    console.log("✅ KYC user created successfully:")
    console.log({
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      businessName: newUser.businessName,
      status: newUser.status,
      email: newUser.email,
      expiry: newUser.expiry,
    })

    return newUser
  } catch (error) {
    console.error("❌ Error creating KYC user:", error)
    throw error
  }
}

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.log(
      "Usage: pnpm tsx src/scripts/create-kyc-user.ts <firstName> <lastName> <email> [businessName] [status]",
    )
    console.log("")
    console.log("Examples:")
    console.log(
      "  pnpm tsx src/scripts/create-kyc-user.ts John Doe john@example.com",
    )
    console.log(
      "  pnpm tsx src/scripts/create-kyc-user.ts Jane Smith jane@company.com 'Acme Corp'",
    )
    console.log(
      "  pnpm tsx src/scripts/create-kyc-user.ts Bob Wilson bob@test.com 'Test LLC' APPROVED",
    )
    console.log("")
    console.log("Status options: PENDING (default), APPROVED, REJECTED")
    process.exit(1)
  }

  const [firstName, lastName, email, businessName, status] = args

  // Validate status if provided
  if (status && !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    console.error(
      "❌ Invalid status. Must be one of: PENDING, APPROVED, REJECTED",
    )
    process.exit(1)
  }

  try {
    await createKYCUser({
      firstName,
      lastName,
      email,
      businessName: businessName || undefined,
      status: (status as "PENDING" | "APPROVED" | "REJECTED") || "PENDING",
    })
  } catch (error) {
    console.error("❌ Failed to create KYC user:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()
