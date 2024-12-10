import { createConfig, mergeAbis } from "@ponder/core";
import { http } from "viem";

import { EASImplAbi } from "./abis/EASImplAbi";
import { EASProxiAbi } from "./abis/EASProxiAbi";
import schemas from "./schemas.config";

export default createConfig({
  networks: {
    optimism: {
      chainId: 10,
      transport: http(process.env.PONDER_RPC_URL_10),
    },
  },
  contracts: {
    EASAttested: {
      network: "optimism",
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
      network: "optimism",
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
