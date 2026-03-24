import { isMiradorEnabled } from "../enabled"

describe("isMiradorEnabled", () => {
  it('returns true only for the exact "true" string', () => {
    expect(isMiradorEnabled("true")).toBe(true)
    expect(isMiradorEnabled("TRUE")).toBe(false)
    expect(isMiradorEnabled("1")).toBe(false)
  })

  it("returns false for unset and false values", () => {
    expect(isMiradorEnabled(undefined)).toBe(false)
    expect(isMiradorEnabled("false")).toBe(false)
  })
})
