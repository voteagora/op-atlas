import { createConfig, mergeAbis } from "ponder";
import { http } from "viem";

import { EASImplAbi } from "./abis/EASImplAbi";
import { EASProxiAbi } from "./abis/EASProxiAbi";
import schemas from "./schemas.config";

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
  chains: {
    optimism: {
      id: 10,
      rpc: http(process.env.PONDER_RPC_URL_10),
    },
  },
  contracts: {
    EASAttested: {
      chain: "optimism",
      abi: mergeAbis([EASProxiAbi, EASImplAbi]),
      address: "0x4200000000000000000000000000000000000021",
      startBlock: 108269604,
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
      address: "0x4200000000000000000000000000000000000021",
      startBlock: 124380685,
      filter: {
        event: "Revoked",
        args: {
          schema: Object.values(schemas).map((schema) => schema.id),
        },
      },
    },
  },
});
