import type { Metadata } from "next"
import { Inter } from "next/font/google"
import AppProvider from "@/providers/AppProvider"
import NextAuthProvider from "@/providers/NextAuthProvider"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import LayoutProvider from "@/providers/LayoutProvider"
import { DialogProvider } from "@/providers/DialogProvider"
import AppDialogs from "@/components/dialogs/AppDialogs"

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
        <NextAuthProvider>
          <AppProvider>
            <DialogProvider>
              <LayoutProvider>
                <AppDialogs />
                {children}

                <Toaster />
              </LayoutProvider>
            </DialogProvider>
          </AppProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
