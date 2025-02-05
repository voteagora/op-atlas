import "./globals.css"

import { GoogleAnalytics } from "@next/third-parties/google"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import AppDialogs from "@/components/dialogs/AppDialogs"
import { CheckIconFilled } from "@/components/icons/checkIconFilled"
import { InfoIconFilled } from "@/components/icons/infoIconFilled"
import { Toaster } from "@/components/ui/sonner"
import Providers from "@/providers/Providers"

import { sharedMetadata } from "./shared-metadata"

const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || ""

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter",
})

export const metadata: Metadata = {
  ...sharedMetadata,
  title: "OP Atlas",
  description:
    "OP Atlas is the home of Optimism Contributors. Discover Retro Funding, grants and governance opportunities on the Superchain.",
  openGraph: {
    ...sharedMetadata.openGraph,
    title: "OP Atlas",
    description:
      "OP Atlas is the home of Optimism Contributors. Discover Retro Funding, grants and governance opportunities on the Superchain.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Providers>
          <AppDialogs />
          {children}
          <Toaster
            icons={{
              loading: <Loader2 size={18} className="animate-spin" />,
              success: <CheckIconFilled size={18} />,
              info: <InfoIconFilled size={18} />,
            }}
          />
        </Providers>
      </body>
      <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
    </html>
  )
}
