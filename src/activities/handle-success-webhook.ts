import type { Webhook } from "../schemas/webhook-schema";

/**
 * Activity function to handle a successful webhook.
 *
 * @param webhook - The parsed Webhook object with status SUCCESS.
 */
export const handleSuccessWebhook = async (webhook: Webhook): Promise<void> =>
  console.log("Wire transfer was successful:", webhook);
// Further processing, such as updating a database or notifying another system
