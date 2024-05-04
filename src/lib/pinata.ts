import sdk from "@pinata/sdk"

if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  throw new Error("PINATA_API_KEY or PINATA_SECRET_API_KEY missing from env")
}

const pinata = new sdk({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
})

export async function testConnection() {
  const res = await pinata.testAuthentication()
  console.log("Pinata test response:", res)
}

export async function uploadToPinata(
  projectId: string,
  json: Record<string, unknown>,
) {
  const res = await pinata.pinJSONToIPFS(json, {
    pinataMetadata: {
      name: "OPRetroFunding",
      projectID: projectId,
    },
  })

  console.info("Uploaded metadata to Pinata:", res)
  return res.IpfsHash
}
