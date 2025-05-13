export const BATCH_SIZE = 100
export const INDEXED_MONTHS = {
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
}
export const MONTHS = Object.values(INDEXED_MONTHS)
export const RETROFUNDING_OP_REWARD_MINIMUM = 200

export const supportedMappings = {
  OPTIMISM: 10,
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

// TODO: Depricate this
export const OSO_QUERY_DATES = {
  DEFAULT: { start: "2025-01-01", end: "2025-07-31" },
  transactions: { start: "2024-10-01", end: "2025-07-31" },
  gasFees: { start: "2025-02-01", end: "2025-02-28" },
}

export const TRANCHE_MONTHS_MAP = {
  1: "February",
  2: "March",
}

export const OSO_QUERY_TRANCHE_CUTOFF_DATES = {
  1: { start: "2025-02-11", end: "2025-03-11" },
  2: { start: "2025-03-11", end: "2025-04-11" },
}

export const CHARTS_TRAILING_DAYS = 3
