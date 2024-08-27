const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is missing from env")
}

type FarcasterUser = {
  fid: number
  username: string
  display_name: string
  custody_address: string
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
}

async function getFarcasterUser(fid: string): Promise<FarcasterUser | null> {
  const params = new URLSearchParams({ fids: fid })
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?${params.toString()}`
  const options = {
    headers: { accept: "application/json", api_key: NEYNAR_API_KEY ?? "" },
  }

  const results = await fetch(url, options)
  const data = (await results.json()) as { users: FarcasterUser[] }
  return data.users[0] ?? null
}

export async function getUserConnectedAddresses(farcasterId: string) {
  const user = await getFarcasterUser(farcasterId)
  return user
    ? [user.custody_address, ...user.verified_addresses.eth_addresses]
    : null
}
