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
  badgeholder: {
    id: "0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b" as `0x${string}`,
    name: "badgeholder",
    attester: [
      "0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9",
      "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
    ],
  },
  gov_contribution: {
    id: "0xef874554718a2afc254b064e5ce9c58c9082fb9f770250499bf406fc112bd315" as `0x${string}`,
    name: "gov_contribution",
    attester: [
      "0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9",
      "0xE4553b743E74dA3424Ac51f8C1E586fd43aE226F",
    ],
  },
  rf_voter: {
    id: "0x41513aa7b99bfea09d389c74aacedaeb13c28fb748569e9e2400109cbe284ee5" as `0x${string}`,
    name: "rf_voter",
  },
};

export default schemas;
