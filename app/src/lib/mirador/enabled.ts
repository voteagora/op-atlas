export function isMiradorEnabled(
  enabled = process.env.NEXT_PUBLIC_MIRADOR_ENABLED,
): boolean {
  return enabled === "true"
}
