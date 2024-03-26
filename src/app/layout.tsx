import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppProvider from "@/providers/AppProvider"
import Header from "@/components/Header"

const inter = Inter({ subsets: ["latin"] })

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
      <body className={inter.className}>
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
