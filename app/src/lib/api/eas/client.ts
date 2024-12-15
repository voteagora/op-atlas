import { createFetchClient } from "../common"

const BASE_URL = process.env.EAS_INDEXER_API_URL!

export const easClient = createFetchClient(BASE_URL)
