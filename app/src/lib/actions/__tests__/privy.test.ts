jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/db/privy", () => ({
  syncPrivyUser: jest.fn(),
}))

jest.mock("@/db/users", () => ({
  getUserById: jest.fn(),
  updateUser: jest.fn(),
}))

jest.mock("@/lib/neynar", () => ({
  getFarcasterProfile: jest.fn(),
}))

const mockDb = {}
const mockSession = { user: { id: "user-1" } }
let mockSessionContext = {
  db: mockDb,
  impersonating: false,
  session: mockSession,
  userId: "user-1" as string | null,
}

jest.mock("@/lib/db/sessionContext", () => ({
  withImpersonation: jest.fn(async (handler: any) =>
    handler(mockSessionContext),
  ),
}))

import { revalidatePath } from "next/cache"

import { getUserById, updateUser } from "@/db/users"
import { getFarcasterProfile } from "@/lib/neynar"

import { refreshCurrentUserFarcasterProfile } from "../privy"

const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>
const mockUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>
const mockGetFarcasterProfile = getFarcasterProfile as jest.MockedFunction<
  typeof getFarcasterProfile
>
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>

describe("refreshCurrentUserFarcasterProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionContext = {
      db: mockDb,
      impersonating: false,
      session: mockSession,
      userId: "user-1",
    }
  })

  it("requires an authenticated user", async () => {
    mockSessionContext.userId = null

    await expect(refreshCurrentUserFarcasterProfile()).rejects.toThrow(
      "Unauthorized",
    )
    expect(mockGetUserById).not.toHaveBeenCalled()
  })

  it("requires a connected Farcaster account", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      farcasterId: null,
    } as any)

    await expect(refreshCurrentUserFarcasterProfile()).rejects.toThrow(
      "No Farcaster account connected",
    )
    expect(mockGetFarcasterProfile).not.toHaveBeenCalled()
  })

  it("updates profile fields from Neynar and revalidates old and new profile paths", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      farcasterId: "123",
      username: "oldhandle",
    } as any)
    mockGetFarcasterProfile.mockResolvedValue({
      name: "New Name",
      username: "newhandle",
      imageUrl: "https://example.com/new.png",
      bio: "Updated bio",
    })
    mockUpdateUser.mockResolvedValue({
      id: "user-1",
      name: "New Name",
      username: "newhandle",
      imageUrl: "https://example.com/new.png",
      bio: "Updated bio",
    } as any)

    await expect(refreshCurrentUserFarcasterProfile()).resolves.toEqual({
      user: {
        id: "user-1",
        name: "New Name",
        username: "newhandle",
        imageUrl: "https://example.com/new.png",
        bio: "Updated bio",
      },
    })

    expect(mockGetFarcasterProfile).toHaveBeenCalledWith("123")
    expect(mockUpdateUser).toHaveBeenCalledWith(
      {
        id: "user-1",
        name: "New Name",
        username: "newhandle",
        imageUrl: "https://example.com/new.png",
        bio: "Updated bio",
      },
      mockDb,
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/profile/details")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/oldhandle")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/newhandle")
  })

  it("updates the effective user while impersonating", async () => {
    mockSessionContext = {
      db: mockDb,
      impersonating: true,
      session: mockSession,
      userId: "target-user",
    }
    mockGetUserById.mockResolvedValue({
      id: "target-user",
      farcasterId: "456",
      username: "targetold",
    } as any)
    mockGetFarcasterProfile.mockResolvedValue({
      name: "Target Name",
      username: "targetnew",
      imageUrl: "https://example.com/target.png",
      bio: "Target bio",
    })
    mockUpdateUser.mockResolvedValue({
      id: "target-user",
      name: "Target Name",
      username: "targetnew",
      imageUrl: "https://example.com/target.png",
      bio: "Target bio",
    } as any)

    await expect(refreshCurrentUserFarcasterProfile()).resolves.toEqual({
      user: {
        id: "target-user",
        name: "Target Name",
        username: "targetnew",
        imageUrl: "https://example.com/target.png",
        bio: "Target bio",
      },
    })

    expect(mockGetUserById).toHaveBeenCalledWith(
      "target-user",
      mockDb,
      mockSession,
    )
    expect(mockGetFarcasterProfile).toHaveBeenCalledWith("456")
    expect(mockUpdateUser).toHaveBeenCalledWith(
      {
        id: "target-user",
        name: "Target Name",
        username: "targetnew",
        imageUrl: "https://example.com/target.png",
        bio: "Target bio",
      },
      mockDb,
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith("/targetold")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/targetnew")
  })

  it("fails when Neynar cannot find the profile", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-1",
      farcasterId: "123",
    } as any)
    mockGetFarcasterProfile.mockResolvedValue(null)

    await expect(refreshCurrentUserFarcasterProfile()).rejects.toThrow(
      "Farcaster profile not found",
    )
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })
})
