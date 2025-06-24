import { prisma } from "@/db/client"
import { CITIZEN_ATTESTATION_CODE, CITIZEN_TYPES } from "@/lib/constants"
import { createCitizenAttestation } from "@/lib/eas"
import { User, UserAddress } from "@prisma/client"
import { getAddress } from "viem"

const addressesToCheck = [
    "0x47E7cEe058E7e33dA6Ea2Ba9Ba7A14ae5d7E8cC4",
    "0x49d2a436899A84ce7EaAf9f5AC506776756d4ea4",
    "0x57De675bb963b341479F98E7c5418Bb3B3de2088",
    "0x6D5eFC4cb936c1d5d13dd9b982C467DD3222A39f",
    "0x249DFBBaf7a9cB9CB47a38e399484DBAec642Cad",
    "0x4a6894Dd556fab996f8D50b521f900CAEedC168e",
    "0x2adeDC3D5044cf64ebeE8Fe3d0e564E133bB672A",
    "0x9BB5c1F229235518274A513a48e3D221995e2D5b",
    "0x13ac7d7da4f9063ba7cabc2ad75f90afb3d0877b",
    "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB",
    "0xA622279f76ddbed4f2CC986c09244262Dba8f4Ba",
    "0xC950b9F32259860f4731D318CB5a28B2dB892f88",
    "0x4F9CCD8C2d017EaDD0CdAaC6692c9BcD96c92e53",
    "0xFdFC6E1BbEc01288447222fC8F1AEE55a7C72b7B",
    "0x155f0A6468f022fE68C25A70fa2DbDbBa2c0B74F",
    "0x5993672EEB4B3e432140D553a0Be330fFCEd1f7D",
    "0x1d671d1B191323A38490972D58354971E5c1cd2A"
]

type UserWithAddresses = User & {
    addresses: UserAddress[]
}

// Standalone function to get user by address without server actions
async function getUserByAddress(address: string): Promise<UserWithAddresses | null> {
    const userAddress = await prisma.userAddress.findFirst({
        where: {
            address,
        },
        include: {
            user: {
                include: {
                    addresses: {
                        orderBy: {
                            primary: "desc",
                        },
                    },
                },
            },
        },
    })

    return userAddress?.user || null
}

// Standalone function to upsert citizen without server actions
async function upsertCitizen({
    id,
    citizen,
}: {
    id: string
    citizen: {
        type: string
        address: string
        attestationId?: string
        timeCommitment?: string
        projectId?: string | null
        organizationId?: string | null
    }
}) {
    return prisma.citizen.upsert({
        where: {
            userId: id,
        },
        update: {
            ...citizen,
        },
        create: {
            userId: id,
            ...citizen,
        },
    })
}

async function createMockCitizens() {


    for (const address of addressesToCheck) {
        try {
            console.log(`\n-------------------------------`)
            console.log(`Processing address: ${address}`)

            // 1. Check if user record exists via UserAddress table
            const user = await getUserByAddress(getAddress(address))

            if (!user) {
                console.log(`No user found for address. Skipping until user logs in.`)
                continue
            }

            // Check if user already has a citizen record
            const existingCitizen = await prisma.citizen.findUnique({
                where: { userId: user.id }
            })

            if (existingCitizen && existingCitizen.attestationId) {
                console.log(`Attestation already exists for user ${user.id}!`)
                continue
            }

            const primaryAddress = user.addresses.find((addr: UserAddress) => addr.primary)?.address || address

            console.log(`Creating attestation for user ${user.id} with address ${primaryAddress}`)

            const attestationId = await createCitizenAttestation({
                to: primaryAddress,
                farcasterId: parseInt(user.farcasterId || "0"),
                selectionMethod: CITIZEN_ATTESTATION_CODE[CITIZEN_TYPES.user],
                refUID: undefined // No refUID for user type
            })

            await upsertCitizen({
                id: user.id,
                citizen: {
                    address: primaryAddress,
                    attestationId,
                    type: CITIZEN_TYPES.user,
                    projectId: null,
                    organizationId: null,
                },
            })

            console.log(`✅ Successfully created citizen record for user ${user.id} with attestation: ${attestationId}`)


        } catch (error) {
            console.error(`❌ Error processing address ${address}:`, error)

        }

    }
}

// Run the script
if (require.main === module) {
    createMockCitizens()
        .then(() => {
            console.log("\nScript completed successfully!\n")
            process.exit(0)
        })
        .catch((error) => {
            console.error("Script failed:", error)
            process.exit(1)
        })
}

export { createMockCitizens }

