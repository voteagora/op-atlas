export const BATCH_SIZE = 100
export const INDEXED_MONTHS = {
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
}
export const MONTHS = Object.values(INDEXED_MONTHS)
export const RETROFUNDING_OP_REWARD_MINIMUM = 200

export const supportedMappings = {
  ARENAZ: 7897,
  BASE: 8453,
  BOB: 60808,
  ETHERNITY: 183, // In S7 but not in data
  INK: 57073,
  LISK: 1135,
  METAL: 1750,
  MINT: 185,
  MODE: 34443,
  OPTIMISM: 10,
  POLYNOMIAL: 8008,
  RACE: 6805,
  SHAPE: 360,
  SONEIUM: 1868,
  SUPERSEED: 5330, // In S7 but not in data
  SWELL: 1923,
  UNICHAIN: 130,
  WORLDCHAIN: 480,
  ZORA: 7777777,
}

// The following are in the data but not in S7:
// AUTOMATA: 65536,
// CYBER: 7560,
// FRAXTAL: 252,
// HAM: 5112,
// KROMA: 255,
// LYRA: 957,
// ORDERLY: 291,
// REDSTONE: 690,
// SWAN: 254,

// TODO: Depricate this
export const OSO_QUERY_DATES = {
  DEFAULT: { start: "2025-01-01", end: "2025-07-31" },
  transactions: { start: "2024-10-01", end: "2025-07-31" },
  gasFees: { start: "2025-02-01", end: "2025-02-28" },
}

export const TRANCHE_MONTHS_MAP = {
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
}

// Maps tranche numbers to date strings (1st of each month)
export const TRANCHE_TO_DATE_MAP = {
  1: "2025-02-01",
  2: "2025-03-01",
  3: "2025-04-01",
  4: "2025-05-01",
  5: "2025-06-01",
  6: "2025-07-01",
  7: "2025-08-01",
  8: "2025-09-01",
  9: "2025-10-01",
  10: "2025-11-01",
}

export const CHARTS_TRAILING_DAYS = 3
