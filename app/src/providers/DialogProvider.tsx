"use client"

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react"

import { DialogType } from "@/components/dialogs/types"

type AppDialog = {
  openDialog: DialogType | undefined
  setOpenDialog: Dispatch<SetStateAction<DialogType | undefined>>
  address: string
  setAddress: Dispatch<SetStateAction<string>>
}
const AppDialogContext = createContext<AppDialog>({} as AppDialog)

export function useAppDialogs() {
  const dialogContext = useContext(AppDialogContext)
  if (!dialogContext) throw new Error("Must be inside a <DialogProvider>")

  return dialogContext
}

export function DialogProvider({ children }: PropsWithChildren) {
  const [openDialog, setOpenDialog] = useState<DialogType>()
  const [address, setAddress] = useState<string>("")
  return (
    <AppDialogContext.Provider
      value={{ openDialog, setOpenDialog, address, setAddress }}
    >
      {children}
    </AppDialogContext.Provider>
  )
}
