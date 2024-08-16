import { parseWebhook } from "../activities/parse-webhook";
import {
  Webhook,
  KnownWebhookSchema,
  UnknownWebhookSchema,
} from "../schemas/webhook-schema";

describe("parseWebhook", () => {
  it("should correctly parse a known webhook type", async () => {
    const knownWebhookData = {
      status: "SUCCESS",
      transactionId: "123e4567-e89b-12d3-a456-426614174000",
      timestamp: "2024-08-17T12:34:56Z",
    };

    const parsedWebhook = await parseWebhook(knownWebhookData);

    // Validate that the result matches the known webhook schema
    expect(KnownWebhookSchema.safeParse(parsedWebhook).success).toBe(true);
    expect(parsedWebhook).toEqual(knownWebhookData);
  });

  it("should correctly parse an unknown webhook type", async () => {
    const unknownWebhookData = {
      someField: "someValue",
      anotherField: "anotherValue",
    };

    const parsedWebhook = await parseWebhook(unknownWebhookData);

    // Validate that the result matches the unknown webhook schema
    expect(UnknownWebhookSchema.safeParse(parsedWebhook).success).toBe(true);
    expect(parsedWebhook).toMatchObject({
      status: "UNKNOWN_WEBHOOK",
      rawPayload: unknownWebhookData,
    });
  });

  it("should handle missing timestamp in unknown webhook", async () => {
    const unknownWebhookData = {
      someField: "someValue",
      anotherField: "anotherValue",
    };

    const parsedWebhook = await parseWebhook(unknownWebhookData);

    // Validate that the timestamp was generated and added
    expect(parsedWebhook).toHaveProperty("timestamp");
  });

  it("should retain the original timestamp in unknown webhook", async () => {
    const unknownWebhookData = {
      someField: "someValue",
      anotherField: "anotherValue",
      timestamp: "2024-08-17T12:34:56Z",
    };

    const parsedWebhook = await parseWebhook(unknownWebhookData);

    // Validate that the original timestamp is retained
    expect(parsedWebhook.timestamp).toBe(unknownWebhookData.timestamp);
  });
});
