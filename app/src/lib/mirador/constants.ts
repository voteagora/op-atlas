export const MIRADOR_TRACE_ID_HEADER = "x-mirador-trace-id"
export const MIRADOR_FLOW_HEADER = "x-mirador-flow"

export const MIRADOR_FLOW = {
  walletLink: "wallet_link",
  governanceVote: "governance_vote",
  projectPublish: "project_publish",
  citizenS9Registration: "citizen_s9_registration",
  citizenS8Registration: "citizen_s8_registration",
  citizenResign: "citizen_resign",
  citizenPrimaryAddressChange: "citizen_primary_address_change",
  projectCreation: "project_creation",
  organizationCreation: "organization_creation",
  missionApplication: "mission_application",
} as const

export const MIRADOR_DEFAULT_TRACE_ID_WAIT_TIMEOUT_MS = 1000
export const MIRADOR_DEFAULT_TRACE_ID_WAIT_INTERVAL_MS = 50
