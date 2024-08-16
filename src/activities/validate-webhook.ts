import { WebhookSchema, Webhook } from "../schemas/webhook-schema";

/**
 * Activity function to parse and validate a webhook.
 *
 * @param webhookData - The raw webhook data to validate and parse.
 * @returns The parsed Webhook object.
 *
 * @throws {z.ZodError} If the webhook data does not conform to the WebhookSchema,
 * this function will throw a ZodError containing detailed information about the validation failures.
 */
export const parseWebhook = async (webhookData: any): Promise<Webhook> =>
  WebhookSchema.parse(webhookData);
