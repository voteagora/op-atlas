/* eslint-disable no-console */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type SeasonSeed = {
  id: string
  name: string
  active: boolean
  startDate: Date
  endDate: Date
  registrationStartDate: Date
  registrationEndDate: Date
  priorityEndDate?: Date | null
  userCitizenLimit?: number | null
}

async function main() {
  const seasons: SeasonSeed[] = [
    {
      id: "8",
      name: "Season 8",
      active: true,
      startDate: new Date("2024-01-01T00:00:00.000Z"),
      endDate: new Date("2024-12-31T23:59:59.000Z"),
      registrationStartDate: new Date("2024-03-15T00:00:00.000Z"),
      registrationEndDate: new Date("2024-06-30T23:59:59.000Z"),
      priorityEndDate: null,
      userCitizenLimit: 1000,
    },
    {
      id: "9",
      name: "Season 9",
      active: false,
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2025-12-31T23:59:59.000Z"),
      registrationStartDate: new Date("2025-03-01T00:00:00.000Z"),
      registrationEndDate: new Date("2025-06-30T23:59:59.000Z"),
      priorityEndDate: new Date("2025-03-11T00:00:00.000Z"),
      userCitizenLimit: 1000,
    },
  ]

  for (const season of seasons) {
    const result = await prisma.season.upsert({
      where: { id: season.id },
      update: {
        name: season.name,
        active: season.active,
        startDate: season.startDate,
        endDate: season.endDate,
        registrationStartDate: season.registrationStartDate,
        registrationEndDate: season.registrationEndDate,
        priorityEndDate: season.priorityEndDate ?? null,
        userCitizenLimit: season.userCitizenLimit ?? null,
      },
      create: {
        id: season.id,
        name: season.name,
        active: season.active,
        startDate: season.startDate,
        endDate: season.endDate,
        registrationStartDate: season.registrationStartDate,
        registrationEndDate: season.registrationEndDate,
        priorityEndDate: season.priorityEndDate ?? null,
        userCitizenLimit: season.userCitizenLimit ?? null,
      },
    })

    console.log(`Upserted season ${result.id} (${result.name})`)
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed seasons:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
