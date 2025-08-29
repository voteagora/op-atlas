import { default as BaseMailchimpTransactional } from "@mailchimp/mailchimp_transactional"


class MailchimpTransactionalClient {
    private static instance: ReturnType<typeof BaseMailchimpTransactional>

    private constructor() { }

    public static getInstance(): ReturnType<typeof BaseMailchimpTransactional> {
        if (!MailchimpTransactionalClient.instance) {
            const apiKey = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY

            if (!apiKey) {
                throw new Error(
                    "Please define MAILCHIMP_TRANSACTIONAL_API_KEY in your environment variables",
                )
            }

            MailchimpTransactionalClient.instance = BaseMailchimpTransactional(apiKey)
        }
        return MailchimpTransactionalClient.instance
    }
}

const mailchimpTransactional = MailchimpTransactionalClient.getInstance()
export default mailchimpTransactional
