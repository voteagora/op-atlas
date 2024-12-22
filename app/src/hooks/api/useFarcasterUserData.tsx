import { useQuery } from "@tanstack/react-query"

type FarcasterUser = {
  object: "user"
  fid: number
  username: string
  display_name: string
  pfp_url: string
  custody_address: string
  profile: {
    bio: {
      text: string
    }
  }
  follower_count: number
  following_count: number
  verifications: any[] // Replace `any` with a specific type if available
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
  verified_accounts: any[] // Replace `any` with a specific type if available
  power_badge: boolean
}

type FarcasterUsers = {
  users: FarcasterUser[]
}

const fetchData = async (fid: string): Promise<FarcasterUsers> => {
  const response = await fetch(`/api/neynar/user/${fid}`)
  const json = await response.json()

  return json
}

export const useFarcasterUserData = (fid: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["farcaster-user"],
    queryFn: async (): Promise<FarcasterUsers> => {
      return fetchData(fid)
    },
  })

  return { user: data, isLoading, error }
}
