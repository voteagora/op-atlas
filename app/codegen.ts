import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "https://www.opensource.observer/api/v1/graphql",
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
