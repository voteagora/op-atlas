import { createConfig, mergeAbis } from "ponder";
import { http } from "viem";

import { EASImplAbi } from "./abis/EASImplAbi";
import { EASProxiAbi } from "./abis/EASProxiAbi";
import schemas, { chainConstants, chainId } from "./schemas.config";

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
  chains: {
    optimism: {
      id: 10,
      rpc: http(process.env.PONDER_RPC_URL),
    },
  },
  contracts: {
    EASAttested: {
      chain: "optimism",
      abi: mergeAbis([EASProxiAbi, EASImplAbi]),
      address: chainConstants[chainId].EAS_ADDRESS,
      startBlock: chainConstants[chainId].START_BLOCK,
      filter: {
        event: "Attested",
        args: {
          schema: Object.values(schemas).map((schema) => schema.id),
        },
      },
    },
    EASRevoked: {
      chain: "optimism",
      abi: mergeAbis([EASProxiAbi, EASImplAbi]),
      address: chainConstants[chainId].EAS_ADDRESS,
      startBlock: chainConstants[chainId].START_BLOCK,
      filter: {
        event: "Revoked",
        args: {
          schema: Object.values(schemas).map((schema) => schema.id),
        },
      },
    },
  },
});
