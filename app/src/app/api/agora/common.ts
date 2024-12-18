import { createFetchClient } from "@/lib/api/common"

export const agoraClient = createFetchClient(
  "https://vote.optimism.io/api/v1",
  {
    Authorization: `Bearer ${process.env.AGORA_API_KEY}`,
  },
)
