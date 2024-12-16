import { createFetchClient } from "../common"

const BASE_URL = process.env.NEXT_PUBLIC_EAS_INDEXER_API_URL!

export const easClient = createFetchClient(BASE_URL)
