import {
  KnownWebhookSchema,
  UnknownWebhookSchema,
  Webhook,
} from "../schemas/webhook-schema";

/**
 * Parses the incoming webhook data and attempts to validate it against known
 * webhook types. If the data doesn't match any known type, it will be coerced
 * into an UnknownWebhook.
 *
 * @param webhookData - The raw data received from the webhook.
 * @returns A Promise that resolves to a Webhook object, either a known type or
 *   an unknown type.
 */
export const parseWebhook = async (webhookData: any): Promise<Webhook> => {
  const result = KnownWebhookSchema.safeParse(webhookData);

  return result.success
    ? result.data
    : UnknownWebhookSchema.parse({
        status: "UNKNOWN_WEBHOOK",
        rawPayload: webhookData,
        timestamp: webhookData.timestamp || new Date().toISOString(),
      });
};
