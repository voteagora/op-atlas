import { createFetchClient } from "../common"

const BASE_URL = "atlas-eas-indexer-production.up.railway.app"

export const easClient = createFetchClient(BASE_URL)
