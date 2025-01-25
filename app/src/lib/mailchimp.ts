import { default as BaseMailchimp } from "@mailchimp/mailchimp_marketing"

class Mailchimp {
  private static instance: typeof mailchimp

  private constructor() {}

  public static getInstance(): typeof BaseMailchimp {
    if (!Mailchimp.instance) {
      const apiKey = process.env.MAILCHIMP_API_KEY
      const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX

      if (!apiKey || !serverPrefix) {
        throw new Error(
          "Please define MAILCHIMP_API_KEY and MAILCHIMP_SERVER_PREFIX in your environment variables",
        )
      }

      BaseMailchimp.setConfig({
        apiKey: apiKey,
        server: serverPrefix,
      })

      Mailchimp.instance = BaseMailchimp
    }
    return Mailchimp.instance
  }
}

const mailchimp = Mailchimp.getInstance()
export default mailchimp
