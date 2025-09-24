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
  projectId?: string
  organizationId?: string
  kycTeamId?: string
  alreadySelectedProjectIds?: string[]
  hasActiveStream?: boolean
  formId?: string
  onSuccess?: (data?: any) => void
  allOrgKycTeams?: any[]
  email?: string
  isNewUser?: boolean
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
    projectId: "",
    organizationId: "",
    kycTeamId: "",
    hasActiveStream: false,
  })

  const handleSetOpenDialog: Dispatch<
    SetStateAction<DialogType | undefined>
  > = (value) => {
    const newType = typeof value === "function" ? value(openDialog) : value
    setOpenDialog(newType)
  }

  return (
    <AppDialogContext.Provider
      value={{
        openDialog,
        setOpenDialog: handleSetOpenDialog,
        address,
        setAddress,
        data,
        setData,
      }}
    >
      {children}
    </AppDialogContext.Provider>
  )
}
