"use server"

import { Md5 } from "ts-md5"
import { z } from "zod"

import mailchimp from "@/lib/mailchimp"

const ContactSchema = z.object({
  email: z.string().email(),
})

const UpdateContactEmailSchema = z.object({
  currentEmail: z.string().email(),
  newEmail: z.string().email(),
})

/**
 *
 * @param {FormData} data - Must contain:
 *   - `email` (string): The user's email address.
 */
export async function addContactToListAction(data: FormData) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  const parsedData = ContactSchema.safeParse({
    email: data.get("email"),
  })

  if (!parsedData.success) {
    throw new Error("Invalid form data")
  }

  const { email } = parsedData.data

  try {
    await mailchimp.lists.addListMember(LIST_ID, {
      email_address: email,
      status: "subscribed",
    })
  } catch (error) {
    console.error("Error adding contact to list", error)
    throw new Error("Error adding contact to list")
  }
}

/**
 *
 * @param {FormData} data - Must contain:
 *   - `email` (string): The user's email address.
 */
export async function removeContactFromListAction(data: FormData) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  const parsedData = ContactSchema.safeParse({
    email: data.get("email"),
  })

  if (!parsedData.success) {
    throw new Error("Invalid form data")
  }

  const { email } = parsedData.data

  try {
    await mailchimp.lists.deleteListMember(LIST_ID, email)
  } catch (error) {
    console.error("Error removing contact from list", error)
    throw new Error("Error removing contact from list")
  }
}

/**
 *
 * @param {FormData} data - Must contain:
 *   - `currentEmail` (string): The user's current email address.
 *   - `newEmail` (string): The user's new email address.
 */
export async function updateContactEmailAction(data: FormData) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  const parsedData = UpdateContactEmailSchema.safeParse({
    currentEmail: data.get("currentEmail"),
    newEmail: data.get("newEmail"),
  })

  if (!parsedData.success) {
    throw new Error("Invalid form data")
  }

  const { currentEmail, newEmail } = parsedData.data

  try {
    const subscriberHash = Md5.hashStr(currentEmail)
    await mailchimp.lists.updateListMember(LIST_ID, subscriberHash, {
      email_address: newEmail,
    })
  } catch (error) {
    console.error("Error changing contact email", error)
    throw new Error("Error changing contact email")
  }
}
