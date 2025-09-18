// Configuration for which tranches are active per season/round combination
export const SEASON_TRANCHES = {
  // Season 7
  "7-7": [1, 2, 3, 4, 5, 6],     // S7 dev-tooling: tranches 1-6
  "7-8": [1, 2, 3, 4, 5, 6],     // S7 onchain-builders: tranches 1-6
  
  // Season 8 (same roundIds, continuing tranches)
  "8-7": [7],                    // S8 dev-tooling: start with tranche 7
  "8-8": [7],                    // S8 onchain-builders: start with tranche 7
} as const

// Map round names to roundIds (stays the same for both seasons 7 and 8)
export const ROUND_IDS = {
  "dev-tooling": "7",
  "onchain-builders": "8",
} as const

export const VALID_SEASONS = [7, 8] as const