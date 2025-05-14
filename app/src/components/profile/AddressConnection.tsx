"use client"

import { ReactNode } from "react"

import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"

import { Button } from "../common/Button"

interface Props {
  children?: ReactNode
  userId: string
}

export const AddressConnection = ({ children, userId }: Props) => {
  const { linkWallet } = usePrivyLinkWallet(userId)

  return (
    <Button variant="primary" onClick={() => linkWallet()}>
      {children}
    </Button>
  )
}
