import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"

import AppDialogs from "@/components/dialogs/AppDialogs"
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
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
