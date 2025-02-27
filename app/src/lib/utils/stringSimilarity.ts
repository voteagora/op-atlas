interface IndividualKYC {
  firstName: string
  lastName: string
  email: string
}

interface PersonaKYC {
  nameFirst: string
  nameLast: string
  personalEmail: string
}

interface BusinessKYB {
  businessName: string
}

interface PersonaKYB {
  businessName: string
}

const NAME_THRESHOLD = 0.7 // 70% similarity for individuals
const BUSINESS_THRESHOLD = 0.8 // 80% similarity for businesses

/**
 * Computes the Jaro Similarity between two strings.
 */
function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0

  const len1 = s1.length
  const len2 = s2.length

  if (len1 === 0 || len2 === 0) return 0.0

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1
  const s1Matches: boolean[] = new Array(len1).fill(false)
  const s2Matches: boolean[] = new Array(len2).fill(false)

  let matches = 0
  let transpositions = 0

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance)
    const end = Math.min(i + matchDistance + 1, len2)

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue
      if (s1[i] !== s2[j]) continue
      s1Matches[i] = s2Matches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0.0

  // Count transpositions
  let k = 0
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  transpositions /= 2

  const jaro =
    (matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3
  return jaro
}

/**
 * Computes Jaro-Winkler similarity (Jaro similarity + prefix bonus).
 */
function jaroWinklerSimilarity(s1: string, s2: string): number {
  const jaro = jaroSimilarity(s1, s2)
  if (jaro === 0) return 0

  let prefixLength = 0
  const maxPrefixLength = 4 // Winkler's rule: first 4 matching chars get extra weight

  for (let i = 0; i < Math.min(s1.length, s2.length, maxPrefixLength); i++) {
    if (s1[i] === s2[i]) {
      prefixLength++
    } else {
      break
    }
  }

  return jaro + prefixLength * 0.1 * (1 - jaro)
}

/**
 * Determines if an individual's KYC information matches the database record.
 */
export function isKYCMatch(db: IndividualKYC, persona: PersonaKYC) {
  const fullNameDB = `${db.firstName} ${db.lastName}`.toLowerCase()
  const fullNamePersona =
    `${persona.nameFirst} ${persona.nameLast}`.toLowerCase()

  const nameSimilarity = jaroWinklerSimilarity(fullNameDB, fullNamePersona)
  const emailMatch =
    db.email.toLowerCase() === persona.personalEmail.toLowerCase()

  const lengthRatio = fullNamePersona.length / fullNameDB.length
  const minLengthRequirement = lengthRatio >= 0.5 // At least 50% of DB name

  return {
    similarity: nameSimilarity,
    match:
      nameSimilarity >= NAME_THRESHOLD && emailMatch && minLengthRequirement,
  }
}

/**
 * Determines if a business's KYB information matches the database record.
 */
export function isKYBMatch(db: BusinessKYB, persona: PersonaKYB) {
  const businessNameDB = db.businessName.toLowerCase()
  const businessNamePersona = persona.businessName.toLowerCase()

  const businessNameSimilarity = jaroWinklerSimilarity(
    businessNameDB,
    businessNamePersona,
  )

  // Prevent matches if the Persona business name is too short relative to the DB name
  const lengthRatio = businessNamePersona.length / businessNameDB.length
  const minLengthRequirement = lengthRatio >= 0.5 // At least 50% of DB name

  return {
    similarity: businessNameSimilarity,
    match: businessNameSimilarity >= BUSINESS_THRESHOLD && minLengthRequirement,
  }
}
