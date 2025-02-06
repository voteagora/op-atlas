"use client"

import { useTransition } from "react"

import {
  addContactToListAction,
  removeContactFromListAction,
  updateContactEmailAction,
} from "./actions"

export function useMailchimp() {
  const [isPending, startTransition] = useTransition()

  const addContact = (email: string) => {
    const formData = new FormData()
    formData.append("email", email)

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await addContactToListAction(formData)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  const removeContact = (email: string) => {
    const formData = new FormData()
    formData.append("email", email)

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await removeContactFromListAction(formData)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  const updateContactEmail = (currentEmail: string, newEmail: string) => {
    const formData = new FormData()
    formData.append("currentEmail", currentEmail)
    formData.append("newEmail", newEmail)

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await updateContactEmailAction(formData)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  return {
    addContact,
    removeContact,
    updateContactEmail,
    isPending,
  }
}
