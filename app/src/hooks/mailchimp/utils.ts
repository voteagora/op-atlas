import { Md5 } from "ts-md5"

import mailchimp from "@/lib/mailchimp"

export async function getContact(email: string) {
  const LIST_ID = process.env.MAILCHIMP_LIST_ID
  if (!LIST_ID) {
    throw new Error("MAILCHIMP_LIST_ID not set")
  }

  try {
    return await mailchimp.lists.getListMember(LIST_ID, Md5.hashStr(email))
  } catch (error: any) {
    if (error.status === 404) {
      return null
    }

    throw new Error("Error getting contact", error)
  }
}

export function tryParseError(error: any) {
  try {
    return JSON.parse(error?.response?.error?.text)
  } catch {
    return error
  }
}
