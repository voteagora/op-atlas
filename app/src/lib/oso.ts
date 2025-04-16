import {
  OsoDeployerContractsReturnType,
  ParsedOsoDeployerContract,
} from "@/lib/types"

const supportedMappings = {
  OP: 10,
  BASE: 8453,
  MODE: 34443,
  WORLDCHAIN: 480,
  POLYNOMIAL: 8008,
  BOB: 60808,
  INK: 57073,
  LISK: 1135,
  METALL2: 1750,
  MINT: 185,
  RACE: 6805,
  SHAPE: 360,
  SONEIUM: 1868,
  SWELL: 1923,
  ZORA: 7777777,
}

export async function getDeployedContracts(
  deployer: string,
): Promise<OsoDeployerContractsReturnType> {
  const contracts = await fetch(`/api/oso/contracts/${deployer}`)

  return contracts.json()
}

export async function getParsedDeployedContracts(
  deployer: string,
): Promise<ParsedOsoDeployerContract[]> {
  const contracts = await getDeployedContracts(deployer)
  return parseOsoDeployerContract(contracts)
}

function osoNamespaceToChainId(namespace: string) {
  return supportedMappings[namespace as keyof typeof supportedMappings]
}

export function parseOsoDeployerContract(
  contract: OsoDeployerContractsReturnType | null,
): ParsedOsoDeployerContract[] {
  if (!contract) {
    return []
  }

  // Filter out contracts that are not supported
  return contract.oso_contractsV0
    .filter((c) => osoNamespaceToChainId(c.contractNamespace))
    .map((c) => ({
      contractAddress: c.contractAddress,
      chainId: osoNamespaceToChainId(c.contractNamespace),
      rootDeployerAddress: c.rootDeployerAddress,
    }))
}

export const OSO_METRICS = {
  activeAddresses: [
    "QdEMc/9T7A9uHmGyebYqTgZtK8RMA4lUDE5vBZP8yYQ=",
    "G2aj792VVSZhk/oENCPGdapeVEozGum9W0o+Y0A5D9w=",
    "ooVpyQAjLTc+L/pUepYBtDtiRvd6CqA35bEdRbfMuXU=",
    "bmtrI5K28X/rHxageGh+VPttf7GHZEbAUItmr8dhWe8=",
    "xdxWbfeAuQawUUnx7SM+WWycBoMrfQtNcSAa6OcKtRI=",
    "9oCVh0sV1tiFxMRFHPNJpgNmsRIm5NUKmhHd1cHpmSc=",
    "YVlXddV9S4PooUOtWsYX5+w9HjhJ55FWCqqIL8i6oH4=",
    "R/AoozORX2lQvbwY8XXNIrsgbyYIKqvLPLiE8pd3kes=",
    "r/PI23PyEA/ke7QvGlLZKqh5xFsv3LA8yVzIo2cGhc8=",
    "N5rcFZ7X5puoKkvcWJIEpunzsEKY9j9A0wNFAK8ckfU=",
    "3PmYaM6TSzeSUaegJELWPREj341+9E5NDH/ycVVwE+g=",
    "dojiObKfwKwo9H51BLnlSeW4qSlUhjBTkhp9TR1A5vo=",
    "j7FEQ7G/ysZGCQDVMolgGA575NBed9nnv7Sos1EBLSc=",
    "PE/HlkQj+5mUPwKeOt3SDiJUA0aL6Ywp3mbvtckk5zM=",
    "krGm5ldFpz2rucJU3/bpQ/YUp1+Wzg/Tzc2l5/Phl04=",
    "TZXfsntBS+NNEe/XYLwnbV+rzNSc2wIIbDIuN+EQTbw=",
    "WqW/XS5Rf1h55Y8e+Aqn1CD51UBSDmk0EbiKPcI7Jz0=",
    "cuuJZDt6Np+B3eweuTZjluazY7JlxJws/lTWckv/i8E=",
    "mfsp8g4ERJkOuBoKG5ZXCsalol+Dw/i771nPJ//dVgc=",
    "J/oTg21YADvP5STmtJ62qKv3dVLCBiIebjCw6s2SS0U=",
    "cKyxsE76OBtW8ZNZWbH7gfXN/+CVM47PPGPssGvmSgU=",
    "enAqApLFF0jQqKXu62ukTqWj+6W7NF/f3zyLrihWrzU=",
    "0RQFDOuKSFfEwcleGnTGb7lM+vZg9nBzZ9WyzOye1js=",
    "jVe/Dpr1TgIxBLbkMoLKmXWTJthxFB0LhHrxWQmt548=",
    "91Lmuq3ndcnbZwqO7660c9j2fAQSVnhTEVR8rWec17M=",
    "gqPrgjDFJo0cxqAjtajifVr4f+ODszjovnISfmqT3qA=",
  ],
  gasFees: [
    "pzNqT8Daqw9cVBYtLmUabuHeMOKoqKKIhTWxXkYrpzM=",
    "dBiekfqo+sEtNxDbBkQGorouPypHsgDGZr4SLlonQIg=",
    "UsJkCKoOnWHj21QXFJR8ZI44SAcpW4y4slfY7tO+hEs=",
    "dorNwoQhkRkspfHJUT1Ko3KdKBvc66bLri8p+Vs9LOs=",
    "Gq9oWmIzQlRK9oBCKFl9Hq6pJ1+cLJ0YehoDqMgFiDc=",
    "UI4Ta1SgepKrMldOUWlHoQjKRoAVZsy5CcagqCLs7zQ=",
    "Zmd1uqzZJu/s1aEBfKoNIsI1zr1HW4L4TvmFGWz1dww=",
    "BDkCiphCMikILGoRru32ca7nZv3SMwQiWCaglqdjygU=",
    "WRqIZSiYhqshpdLzine30aLZzrgBMk2VE54LjX5XtYw=",
    "AMw6OBo4fFmxlSKHRHRPQfoKGPEmqn4rPVqDUurMHiE=",
    "WpFQBuYoeR60ZkEdq7cLfj2fIk7tjk/P58/Y9/9UcKA=",
    "7hOXfiIhXdOxobTRvSXOROojLY/V8vg0INh5RJ3N0a8=",
    "UYS/nGacZGua8TkIidJnB6jEXMNoJym9o79LrILlHKM=",
    "1PD0AamFG56j+rMmIyuOjGZhYyH+CLe2mmgzWLIPgvg=",
    "9sIaU9P33t5IXsKtGRZdvELh9Eo9rjK94C+1q2PgniM=",
    "59ZUc7ZNdPqkd9y5CNhprWxcpZcCKancDfQ0KcmvzeI=",
    "Zy5WZtLLI+w8TBAUFy5CDO+Uf5ijhkY4sTLul0OixLI=",
    "CSirey5zj7PgDS76fCKmRF55kR6ZZ/myIj7ccA0b4xA=",
    "DqqSYMg+bxFEw7N39M3GtciAXkCXiARdDIWaUyRmbZw=",
    "r9XtmkpoYKTw6TWuHxy6+ASoX8bHl0ZB9sR2RdsQrVA=",
    "GudxCxGrnuRl4MITnpHCIAtZZ25wmiNhDCJCBgEiIqs=",
    "mO+/sxrE4vJZfrQO3bFjYtMT9iK/RfGdXoDkekY5Bh8=",
    "RPbKsmdW0/HirF7l75QQd0Nl02deTVxOCCrFFupKHq0=",
    "hXw/qm4zZq7F+r3+FpPwE11FA6TD7H/cnY0+t697fq0=",
    "4Bi3sOZJ/iDa6Z4pvWMi0IrTTd/oHMqqKqjMKUkjWSQ=",
    "cgfAWKq1l/V12yl1VKIGxFDmaFuotwck19DV+KGl6XY=",
  ],
  transactions: [
    "q4NLzrfmhVgSYYqjehgcKlF7UieUf2voBEujC+NUFTA=",
    "8vTagJLAu5fbgEOQ6nqnLsRqbQ7dDOQANWfiaPKDVPc=",
    "7TxBAoGkHbFQVdlDuEc3DaBnnhv1OndNhDU3CPuoQgk=",
    "6AvLGOSx2UUp3dpKpo1LDvSOIDBSEhvS9Q0v6RnRhjc=",
    "0X0E2Qw4Yw7O6LT7F/0T2Suvw653kaOBbZDLN3Pyrzc=",
    "47RtkDIh7ngSFkzF7NOQyNPaklRSEh3qk646NVBWR9E=",
    "WOxUb39soikSlTz0N9gJZh9UkU5v8+TLRAFanTBWHhE=",
    "7KViuoILkoOnzVVzje2b/x+5NreQPCIKyPg2wfNRWkU=",
    "ZzjWGe/z2Pp2O/YVFdE9pqehiyguEA9aU151JmYhL0o=",
    "4GCrq1tV4lG2wog4x5QDTZlagC596ePXb81VTJ70iPI=",
    "Equrcnwc9BB4hiIfBnUERlYfkS/YAIOySc4TxaUO6ik=",
    "VbulzPqVTPfCYb25Mjb9bQdJLzc1ikWPeGlux0fOQG8=",
    "9pij1uGT9MQExHMn80lNumID1qJYgK13KHFd831EkCg=",
    "OVljq6aZt9O5d5Bk0RpoAEXJ+nJr80fkry5+f7RUuRk=",
    "tkBVLeBe0w2hwkx06ZXmOX1SBo4LbkpkJrrotdLyNqE=",
    "bVI151haJ2r61X0fAxSaId6GcSkbjzCtvenssir2xyQ=",
    "I9of/x8ND34LG7QhxMz3qQ5D8pGu5lp1mDgTSpKOyx4=",
    "iBu1PdxvF7T1DxeCDWSWs0gEde1RW1JbJM1PeT0j6f4=",
    "sx523C3ZYiddSQ0TJoicp7dZSXba9ARU1CnfqWlLJpw=",
    "8+lPnL/LSKHm+umCoV5gJLTGmcNTV3elkkulCCsCoqg=",
    "gT4s4pNWxbhzR/3DycM5to0g4TsFIUuRmSuV7EOInus=",
    "Am3N4BBwxACUKPAVFDa0fsbxW+Jr+GAfC/Pyl6U3zeo=",
    "R9tEDC01Bad5RkKenWotOIuPVJUlTwHhste5/YO0L/o=",
    "jhH5vIoiz/7mwgCrpDEyEeCnhtNGn+MXgEXgAzSrn8s=",
    "TrlgnoqdDxLQZP09awG12o31j3qEiDv6WTaYjz5E7Ng=",
    "nK05Pdeg9M6n0mrOXYiFIopRs5t/tzDWwMIHJLmmPX8=",
  ],
  tvl: [
    "ss5IHd8zzw7KGYM1PWGYFe7H2fVLq8x8CJZwVBI8nLc=",
    "Myz6ifp4t62tT3uXov0qe5eOSYX4pasxjUzOzDyxvwk=",
    "5+SjFSEgi1CurNH1pVdGEXLbXuTTSXj6w17ma8w/qlE=",
    "PTkbAgVzNKiRx2stgyLeWaq5KGxrhwwBmfOCN5YmP1o=",
    "J7lEviP96Q3/7G3d/f401LAI6kGfjT6wzG+ZODStke8=",
    "dpw811b5/55RV9CZfnpkGSdLlOP1hdp0OF952XVUTWU=",
    "ki01wlulG50z6M9l8l5sQehPU9rDrxFmutPQqDUhIiM=",
    "ndFsC8I6H09EX6VAYQ59iKF4oaCTOkylu08tqVI+6gY=",
    "qlmqaIagTHAic/MX57vOmSprhncNDLYghKF0dM9+m3w=",
    "UiLK0j/dZtUWZUiLLB1CzdjkN2xGi/PMVWNvhUS03MU=",
    "5cxOotfRvkVUHBXfoGxyQiGuqrhGAox3TuNfKI3/OMQ=",
    "EZt+fei9OcaI4qH4/VOs+DqUGF5o56BmQLE2EX/ur9o=",
    "+hPVJiVcO3aF1fsFSDQs0hNhv6Ebtu/G8e1JbaL2lEU=",
    "waUx+j75/SloH+se3JVW3oDt2Z8AgvO/QwcxMwoOKkI=",
    "yDQTF2Jvodg/6XgVmx5t3QdDy4BGMqyi/JMa2U4jQMA=",
  ],
}

export const OSO_QUERY_DATES = {
  DEFAULT: { start: "2025-01-01", end: "2025-07-31" },
  transactions: { start: "2024-10-01", end: "2025-07-31" },
  gasFees: { start: "2025-02-01", end: "2025-02-28" },
}
