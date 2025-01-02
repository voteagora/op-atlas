import { createFetchClient } from "@/lib/api/common"

export const neynarClient = createFetchClient(
  "https://api.neynar.com/v2/farcaster",
  {
    accept: "application/json",
    "x-neynar-experimental": "false",
    "x-api-key": process.env.NEYNAR_API_KEY ?? "",
  },
)
