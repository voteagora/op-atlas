import "dotenv/config";

import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: {
    "https://www.oso.xyz/api/v1/graphql": {
      headers: {
        Authorization: `Bearer ${process.env.OSO_AUTH_TOKEN ?? ""}`,
      },
    },
  },
  generates: {
    "./src/graphql/__generated__/types.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
  config: {
    dedupeFragments: true,
    exposeDocument: true,
    exposeQueryKeys: true,
    exposeMutationKeys: true,
    legacyMode: false,
    addInfiniteQuery: true,
    pureMagicComment: true,
    exposeFetcher: true,
  },
}

export default config
