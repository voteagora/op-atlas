const schemas: {
  [key: string]: {
    id: `0x${string}`;
    name: string;
    attester?: `0x${string}`;
  };
} = {
  citizen: {
    id: "0xc35634c4ca8a54dce0a2af61a9a9a5a3067398cb3916b133238c4f6ba721bc8a" as `0x${string}`,
    name: "citizen",
  },
  badgeholder: {
    id: "0xfdcfdad2dbe7489e0ce56b260348b7f14e8365a8a325aef9834818c00d46b31b" as `0x${string}`,
    name: "badgeholder",
    attester: "0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9",
  },
};

export default schemas;
