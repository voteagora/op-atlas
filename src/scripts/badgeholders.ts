import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // load badgeholders from badgeholders.json
  const BadgeholderData = require("../lib/badgeholders.json")

  for (const badgeholder of BadgeholderData) {
    await prisma.badgeholder.create({
      data: {
        address: badgeholder.address,
        roundId: badgeholder.retro_funding_round,
      },
    })
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
