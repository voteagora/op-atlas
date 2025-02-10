"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { prisma } from "@/db/client"

export async function makeUserAddressPrimary(address: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const existingPrimary = await prisma.userAddress.findFirst({
    where: {
      primary: true,
      userId: session.user.id,
    },
  })
  if (existingPrimary) {
    await prisma.userAddress.update({
      where: {
        address_userId: {
          address: existingPrimary.address,
          userId: session.user.id,
        },
      },
      data: {
        primary: false,
      },
    })
  }

  await prisma.userAddress.update({
    where: {
      address_userId: {
        address,
        userId: session.user.id,
      },
    },
    data: {
      primary: true,
    },
  })

  revalidatePath("/profile/verified-addresses")
}
