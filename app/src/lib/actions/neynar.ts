import { getFarcasterUser } from "../neynar"

export const getFarcasterUserData = async (fid: string) => {
  const user = await getFarcasterUser(fid)
  return user
}
