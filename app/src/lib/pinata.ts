import { PinataSDK } from "pinata-web3"

const __isE2E__ = process.env.NEXT_PUBLIC_E2E === "true"

function createClient() {
  if (__isE2E__) {
    return {
      upload: {
        json: (_json: Record<string, unknown>) => ({
          addMetadata: async () => ({ IpfsHash: "bafy-mock-hash" }),
        }),
      },
      testAuthentication: async () => ({ authenticated: true }),
    } as any
  }
  if (!process.env.PINATA_JWT) {
    throw new Error("PINATA_JWT is missing from env")
  }
  if (!process.env.NEXT_PUBLIC_GATEWAY_URL) {
    throw new Error("NEXT_PUBLIC_GATEWAY_URL is missing from env")
  }
  return new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
  })
}

const pinata = createClient()

export async function testConnection() {
  const res = await pinata.testAuthentication()
  console.log("Pinata test response:", res)
}

export async function uploadToPinata(
  projectId: string,
  json: Record<string, unknown>,
) {
  const res = await pinata.upload.json(json).addMetadata({
    name: "OPRetroFunding",
    keyValues: {
      projectId: projectId,
    },
  })

  return res.IpfsHash
}
