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

type DataType = {
  address?: string
  organizationProject?: boolean
  projectId?: string
  organizationId?: string
  kycTeamId?: string
  alreadySelectedProjectIds?: string[]
}

type AppDialog = {
  openDialog: DialogType | undefined
  setOpenDialog: Dispatch<SetStateAction<DialogType | undefined>>
  address: string
  setAddress: Dispatch<SetStateAction<string>>
  data: DataType
  setData: Dispatch<SetStateAction<DataType>>
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
  const [data, setData] = useState<DataType>({
    address: "",
    organizationProject: false,
    projectId: "",
    organizationId: "",
    kycTeamId: "",
  })

  return (
    <AppDialogContext.Provider
      value={{ openDialog, setOpenDialog, address, setAddress, data, setData }}
    >
      {children}
    </AppDialogContext.Provider>
  )
}
