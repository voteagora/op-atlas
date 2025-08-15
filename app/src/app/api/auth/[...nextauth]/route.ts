import { handlers } from "@/auth"

export const runtime = process.env.NEXT_PUBLIC_E2E === "true" ? "nodejs" : undefined

export const { GET, POST } = handlers
