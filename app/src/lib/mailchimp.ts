import { default as BaseMailchimp } from "@mailchimp/mailchimp_marketing"

type MailchimpClient = typeof BaseMailchimp

let cachedClient: MailchimpClient | null = null

export function getMailchimp(): MailchimpClient {
  if (cachedClient) return cachedClient

  const apiKey = process.env.MAILCHIMP_API_KEY
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX

  if (apiKey && serverPrefix) {
    BaseMailchimp.setConfig({ apiKey, server: serverPrefix })
    cachedClient = BaseMailchimp
    return cachedClient
  }

  const noop = {
    lists: {
      getListMembersInfo: async () => ({ members: [] }),
      batchListMembers: async () => ({ updated_members: [], new_members: [] }),
      addListMember: async () => ({}),
      deleteListMember: async () => ({}),
      updateListMember: async () => ({}),
      getListMember: async () => null,
    },
  } as unknown as MailchimpClient

  cachedClient = noop
  return cachedClient
}
