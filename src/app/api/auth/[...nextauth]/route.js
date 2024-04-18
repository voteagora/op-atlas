import NextAuth from "next-auth"
import { authOptions } from "./authOptions"

if (!process.env.NEXT_PUBLIC_APP_DOMAIN) {
  throw new Error("Please define NEXT_PUBLIC_APP_DOMAIN in .env")
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
