import "./globals.css"

import { Loader2 } from "lucide-react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import AppDialogs from "@/components/dialogs/AppDialogs"
import { CheckIconFilled } from "@/components/icons/checkIconFilled"
import { InfoIconFilled } from "@/components/icons/infoIconFilled"
import { Toaster } from "@/components/ui/sonner"
import Providers from "@/providers/Providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter",
})

export const metadata: Metadata = {
  title: "Retro Funding",
  description: "Applications are now open for Round 4: Onchain Builders",
  icons: "/favicon.ico",
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
    </html>
  )
}
