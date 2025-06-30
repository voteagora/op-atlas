export const OP_FOUNDATION_ADDRESSES = [
  "0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9" as `0x${string}`,
  "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F" as `0x${string}`,
];

const schemas: {
  [key: string]: {
    id: `0x${string}`;
    name: string;
    attester?: `0x${string}`[];
  };
} = {
  citizen: {
    id: "0xc35634c4ca8a54dce0a2af61a9a9a5a3067398cb3916b133238c4f6ba721bc8a" as `0x${string}`,
    name: "citizen",
  },
  gov_contribution: {
    id: "0xef874554718a2afc254b064e5ce9c58c9082fb9f770250499bf406fc112bd315" as `0x${string}`,
    name: "gov_contribution",
    attester: OP_FOUNDATION_ADDRESSES,
  },
  badgeholder: {
    id: "0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b" as `0x${string}`,
    name: "badgeholder",
    attester: OP_FOUNDATION_ADDRESSES,
  },
  rf_voter: {
    id: "0x41513aa7b99bfea09d389c74aacedaeb13c28fb748569e9e2400109cbe284ee5" as `0x${string}`,
    name: "rf_voter",
  },
  votes: {
    id: "0xc113116804c90320b3d059ff8eed8b7171e3475f404f65828bbbe260dce15a99" as `0x${string}`,
    name: "votes",
  },
};

export default schemas;
