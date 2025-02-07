"use server"

import { Md5 } from "ts-md5"

import { auth } from "@/auth"
import { getContact } from "@/lib/api/mailchimp"
import mailchimp from "@/lib/mailchimp"

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

  const email = data.get("email") as string

  const contact = await getContact(email)
  if (contact) {
    return
  }

  try {
    await mailchimp.lists.addListMember(LIST_ID, {
      email_address: email,
      status: "subscribed",
    })
  } catch (error: any) {
    console.log("Error adding contact email", error)
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

  const email = data.get("email") as string

  try {
    await mailchimp.lists.deleteListMember(LIST_ID, email)
  } catch (error: any) {
    console.log("Error removing contact email", error)
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

  const currentEmail = data.get("currentEmail") as string
  const newEmail = data.get("newEmail") as string

  try {
    const subscriberHash = Md5.hashStr(currentEmail)

    await mailchimp.lists.updateListMember(LIST_ID, subscriberHash, {
      email_address: newEmail,
      status: "subscribed",
    })
  } catch (error: any) {
    console.log("Error updating contact email", error)
  }
}
