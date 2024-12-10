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
            "0x5ebff8ad62d203585850493a9699d7f32d0de739ff7f7421f1ad64d6ddf7749d",
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
            "0x5ebff8ad62d203585850493a9699d7f32d0de739ff7f7421f1ad64d6ddf7749d",
          ],
        },
      },
    },
  },
});
