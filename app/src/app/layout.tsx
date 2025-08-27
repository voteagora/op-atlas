import "./globals.css"

import { GoogleAnalytics } from "@next/third-parties/google"
import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import localFont from "next/font/local"

import AppDialogs from "@/components/dialogs/AppDialogs"
import ErrorBoundary from "@/components/common/ErrorBoundary"
import { CheckIconFilled } from "@/components/icons/checkIconFilled"
import { InfoIconFilled } from "@/components/icons/infoIconFilled"
import { Toaster } from "@/components/ui/sonner"
import Providers from "@/providers/Providers"

import { sharedMetadata } from "./shared-metadata"

const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || ""

const riforma = localFont({
  src: [
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-Heavy.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/riforma/RiformaLLWeb-HeavyItalic.woff2",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-riforma",
  display: "swap",
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
      <body className={`${riforma.className}`}>
        <Providers>
          <ErrorBoundary>
            <AppDialogs />
            {children}
            <Toaster
              icons={{
                loading: <Loader2 size={18} className="animate-spin" />,
                success: <CheckIconFilled size={18} />,
                info: <InfoIconFilled size={18} />,
              }}
            />
          </ErrorBoundary>
        </Providers>
      </body>
      <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
    </html>
  )
}
