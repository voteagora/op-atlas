jest.mock("server-only", () => ({}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/db/citizens", () => ({
  updateCitizen: jest.fn(),
}))

jest.mock("@/db/users", () => ({
  addUserSafeAddress: jest.fn(),
  getUserById: jest.fn(),
  makeUserAddressPrimary: jest.fn(),
  removeUserSafeAddress: jest.fn(),
}))

jest.mock("@/lib/actions/citizens", () => ({
  getCitizen: jest.fn(),
}))

jest.mock("@/lib/db/sessionContext", () => ({
  getImpersonationContext: jest.fn(),
}))

jest.mock("@/lib/eas/serverOnly", () => ({
  createCitizenAttestationWithTx: jest.fn(),
  createCitizenWalletChangeAttestationWithTx: jest.fn(),
  revokeCitizenAttestationWithTx: jest.fn(),
}))

jest.mock("@/lib/eas/txContext", () => ({
  extractFailedEasTxContext: jest.fn(() => ({})),
}))

jest.mock("@/lib/eth", () => ({
  clients: {},
}))

jest.mock("@/lib/utils/contracts", () => ({
  Chain: {
    OPMainnet: 10,
  },
}))

jest.mock("@/lib/mirador/serverTrace", () => ({
  appendServerTraceEvent: jest.fn(),
  closeMiradorServerTrace: jest.fn(),
  startMiradorServerTrace: jest.fn(),
  withMiradorTraceStep: jest.fn((traceContext, step, source = "backend") =>
    traceContext
      ? {
          ...traceContext,
          step,
          source,
        }
      : undefined,
  ),
}))

import { updateCitizen } from "@/db/citizens"
import { getUserById, makeUserAddressPrimary } from "@/db/users"
import { getCitizen } from "@/lib/actions/citizens"
import { getImpersonationContext } from "@/lib/db/sessionContext"
import {
  createCitizenAttestationWithTx,
  createCitizenWalletChangeAttestationWithTx,
  revokeCitizenAttestationWithTx,
} from "@/lib/eas/serverOnly"
import {
  appendServerTraceEvent,
  closeMiradorServerTrace,
  startMiradorServerTrace,
} from "@/lib/mirador/serverTrace"

import { makeUserAddressPrimaryAction } from "../actions"

describe("makeUserAddressPrimaryAction", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(
      getImpersonationContext as jest.MockedFunction<
        typeof getImpersonationContext
      >
    ).mockResolvedValue({
      session: {},
      db: {},
      userId: "user-1",
    } as any)
  })

  it("does not create a Mirador trace for offchain-only primary address changes", async () => {
    ;(
      getCitizen as jest.MockedFunction<typeof getCitizen>
    ).mockResolvedValue({
      attestationId: "att-1",
      address: "0xabc",
    } as any)

    await makeUserAddressPrimaryAction("0xabc")

    expect(makeUserAddressPrimary).toHaveBeenCalledWith(
      "0xabc",
      "user-1",
      {},
      {},
    )
    expect(startMiradorServerTrace).not.toHaveBeenCalled()
    expect(appendServerTraceEvent).not.toHaveBeenCalled()
    expect(closeMiradorServerTrace).not.toHaveBeenCalled()
  })

  it("starts and closes a server-owned Mirador trace when re-attestation is required", async () => {
    const standaloneTrace = { trace: "primary-address-trace" }

    ;(
      getCitizen as jest.MockedFunction<typeof getCitizen>
    ).mockResolvedValue({
      attestationId: "att-1",
      address: "0xold",
      type: "user",
      organizationId: null,
      projectId: null,
    } as any)
    ;(
      getUserById as jest.MockedFunction<typeof getUserById>
    ).mockResolvedValue({
      farcasterId: "123",
    } as any)
    ;(
      revokeCitizenAttestationWithTx as jest.MockedFunction<
        typeof revokeCitizenAttestationWithTx
      >
    ).mockResolvedValue({
      txHash: "0xrevocation",
      chainId: 10,
      txInputData: "0xdeadbeef",
    } as any)
    ;(
      createCitizenAttestationWithTx as jest.MockedFunction<
        typeof createCitizenAttestationWithTx
      >
    ).mockResolvedValue({
      attestationId: "att-2",
      txHash: "0xnew-citizen",
      chainId: 10,
      txInputData: "0xfeedface",
    } as any)
    ;(
      createCitizenWalletChangeAttestationWithTx as jest.MockedFunction<
        typeof createCitizenWalletChangeAttestationWithTx
      >
    ).mockResolvedValue({
      txHash: "0xwallet-change",
      chainId: 10,
      txInputData: "0xbead",
    } as any)
    ;(
      startMiradorServerTrace as jest.MockedFunction<
        typeof startMiradorServerTrace
      >
    ).mockReturnValue(standaloneTrace as any)

    await makeUserAddressPrimaryAction("0xnew")

    expect(startMiradorServerTrace).toHaveBeenCalledWith({
      name: "PrimaryAddressChange",
      flow: "citizen_primary_address_change",
      context: {
        userId: "user-1",
        walletAddress: "0xnew",
        sessionId: "user-1",
      },
      tags: ["citizen", "address_change", "backend"],
    })
    expect(appendServerTraceEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        trace: standaloneTrace,
        eventName: "primary_address_change_reattest_started",
      }),
    )
    expect(appendServerTraceEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        trace: standaloneTrace,
        eventName: "primary_address_change_reattest_succeeded",
      }),
    )
    expect(updateCitizen).toHaveBeenCalledWith(
      {
        id: "user-1",
        citizen: {
          attestationId: "att-2",
          address: "0xnew",
        },
      },
      {},
    )
    expect(closeMiradorServerTrace).toHaveBeenCalledWith(
      standaloneTrace,
      "Primary address change succeeded",
    )
  })
})
