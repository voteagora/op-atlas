const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY

type FarcasterUser = {
  fid: number
  username: string
  display_name: string
  pfp_url?: string | null
  custody_address: string
  profile?: {
    bio?: {
      text?: string | null
    }
  }
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
}

export type FarcasterProfile = {
  name: string | null
  username: string | null
  imageUrl: string | null
  bio: string | null
}

const emptyToNull = (value?: string | null) => {
  if (!value) {
    return null
  }

  return value.trim() ? value : null
}

async function getFarcasterUser(fid: string): Promise<FarcasterUser | null> {
  if (!NEYNAR_API_KEY) {
    throw new Error("NEYNAR_API_KEY is missing from env")
  }

  const params = new URLSearchParams({ fids: fid })
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?${params.toString()}`
  const options = {
    headers: { accept: "application/json", api_key: NEYNAR_API_KEY ?? "" },
  }

  const results = await fetch(url, options)
  if (!results.ok) {
    throw new Error(
      `Neynar user lookup failed: ${results.status} ${results.statusText}`,
    )
  }

  const data = (await results.json()) as { users: FarcasterUser[] }
  return data.users[0] ?? null
}

export async function getFarcasterProfile(
  farcasterId: string | null,
): Promise<FarcasterProfile | null> {
  if (!farcasterId) {
    return null
  }

  const user = await getFarcasterUser(farcasterId)
  if (!user) {
    return null
  }

  return {
    name: emptyToNull(user.display_name),
    username: emptyToNull(user.username),
    imageUrl: emptyToNull(user.pfp_url),
    bio: emptyToNull(user.profile?.bio?.text),
  }
}

export async function getUserConnectedAddresses(farcasterId: string | null) {
  if (!farcasterId) {
    return null
  }

  const user = await getFarcasterUser(farcasterId)
  return user
    ? [user.custody_address, ...(user.verified_addresses?.eth_addresses ?? [])]
    : null
}
