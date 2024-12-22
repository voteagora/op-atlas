import { getFarcasterUser } from "../neynar"

export const getFarcasterUserData = async (fid: string) => {
  try {
    const user = await getFarcasterUser(fid)
    if (user) {
      return {
        error: null,
        user: user ?? null,
      }
    }
  } catch (error: unknown) {
    console.error("Error searching for user", (error as Error).message)
    return {
      error: "Error searching for user",
    }
  }
}
