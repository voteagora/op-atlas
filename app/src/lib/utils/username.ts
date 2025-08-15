const __isEdge__ = typeof globalThis !== "undefined" && !(globalThis as any).process?.versions?.node
const createHash = __isEdge__
  ? (algo: string) => ({
      update: (s: string) => ({ digest: () => s.slice(0, 64) }),
    })
  : require("crypto").createHash

export function generateTemporaryUsername(id: string): string {
  const suffix = createHash("sha256").update(id).digest("hex").slice(0, 8)

  return `optimist-${suffix}`
}
