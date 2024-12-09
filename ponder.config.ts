import { createConfig, mergeAbis } from "@ponder/core";
import { http } from "viem";

import { EASImplAbi } from "./abis/EASImplAbi";
import { EASProxiAbi } from "./abis/EASProxiAbi";

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
      startBlock: 124380685,
      filter: {
        event: "Attested",
        args: {
          schema: [
            "0xff0b916851c1c5507406cfcaa60e5d549c91b7f642eb74e33b88143cae4b47d0",
          ],
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
          schema: [
            "0xff0b916851c1c5507406cfcaa60e5d549c91b7f642eb74e33b88143cae4b47d0",
          ],
        },
      },
    },
  },
});
