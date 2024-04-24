"use client"

import AppProvider from "./AppProvider"
import { DialogProvider } from "./DialogProvider"
import LayoutProvider from "./LayoutProvider"
import NextAuthProvider from "./NextAuthProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <AppProvider>
        <DialogProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </DialogProvider>
      </AppProvider>
    </NextAuthProvider>
  )
}
