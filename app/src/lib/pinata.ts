import { PinataSDK } from "pinata-web3"

if (!process.env.PINATA_JWT) {
  throw new Error("PINATA_JWT is missing from env")
}

if (!process.env.NEXT_PUBLIC_GATEWAY_URL) {
  throw new Error("NEXT_PUBLIC_GATEWAY_URL is missing from env")
}

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
})

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
