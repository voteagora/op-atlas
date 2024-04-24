import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import AppDialogs from "@/components/dialogs/AppDialogs"
import Providers from "@/providers/Providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter",
})

export const metadata: Metadata = {
  title: "OP Atlas app",
  description: "OP Atlas",
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
