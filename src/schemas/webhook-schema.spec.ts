import { z } from "zod";
import { WebhookSchema } from "./webhook-schema";
import * as fc from "fast-check";

describe("WebhookSchema with fast-check", () => {
  // Define a reasonable date range for the timestamp
  const dateRange = {
    min: new Date("2000-01-01T00:00:00.000Z"),
    max: new Date("2100-01-01T00:00:00.000Z"),
  };

  // Valid Webhook arbitrary generator for SUCCESS status
  const successWebhookArbitrary = fc.record({
    transactionId: fc.uuid(),
    status: fc.constant("SUCCESS"),
    comments: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
      nil: undefined,
    }),
    timestamp: fc.date(dateRange).map((d) => d.toISOString()),
    failureReason: fc.constant(undefined), // Ensure failureReason is absent
  });

  // Valid Webhook arbitrary generator for FAILURE status
  const failureWebhookArbitrary = fc.record({
    transactionId: fc.uuid(),
    status: fc.constant("FAILURE"),
    comments: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
      nil: undefined,
    }),
    timestamp: fc.date(dateRange).map((d) => d.toISOString()),
    failureReason: fc.constantFrom(
      "INSUFFICIENT_FUNDS",
      "ACCOUNT_CLOSED",
      "ACCOUNT_NOT_FOUND",
      "NETWORK_ERROR",
      "INTERNAL_ERROR"
    ),
  });

  it("should validate a correct SUCCESS webhook", () => {
    fc.assert(
      fc.property(successWebhookArbitrary, (validWebhook) => {
        WebhookSchema.parse(validWebhook); // Should not throw
      })
    );
  });

  it("should validate a correct FAILURE webhook", () => {
    fc.assert(
      fc.property(failureWebhookArbitrary, (validWebhook) => {
        WebhookSchema.parse(validWebhook); // Should not throw
      })
    );
  });

  it("should fail validation for a SUCCESS webhook with failureReason present", () => {
    const invalidWebhookArbitrary = successWebhookArbitrary.map((webhook) => ({
      ...webhook,
      failureReason: "INSUFFICIENT_FUNDS", // Invalid for SUCCESS
    }));

    fc.assert(
      fc.property(invalidWebhookArbitrary, (invalidWebhook) => {
        expect(() => WebhookSchema.parse(invalidWebhook)).toThrow(z.ZodError);
      })
    );
  });

  it("should fail validation for a FAILURE webhook with failureReason absent", () => {
    const invalidWebhookArbitrary = failureWebhookArbitrary.map((webhook) => ({
      ...webhook,
      failureReason: undefined, // Invalid for FAILURE
    }));

    fc.assert(
      fc.property(invalidWebhookArbitrary, (invalidWebhook) => {
        expect(() => WebhookSchema.parse(invalidWebhook)).toThrow(z.ZodError);
      })
    );
  });

  // Additional edge cases and invalid scenarios can be added here
});
