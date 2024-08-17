import { z } from "zod";

// Define the possible failure reasons if the status is 'FAILURE'
const FailureReasonSchema = z.enum([
  "INSUFFICIENT_FUNDS",
  "ACCOUNT_CLOSED",
  "ACCOUNT_NOT_FOUND",
  "NETWORK_ERROR",
  "INTERNAL_ERROR",
]);

// Shared properties for all webhooks
const sharedProperties = {
  transactionId: z.string().uuid(),
  requestId: z.string().uuid(),
  timestamp: z.string().datetime(),
  comments: z.string().optional(),
};

// Define specific webhook types using `status` as a discriminator
export const WireTransferSuccessSchema = z.object({
  ...sharedProperties,
  status: z.literal("SUCCESS"),
  failureReason: z.undefined(), // failureReason must be absent
});
export type WireTransferSuccess = z.infer<typeof WireTransferSuccessSchema>;

export const WireTransferFailureSchema = z.object({
  ...sharedProperties,
  status: z.literal("FAILURE"),
  failureReason: FailureReasonSchema, // failureReason must be present
});
export type WireTransferFailure = z.infer<typeof WireTransferFailureSchema>;

// Union of all known webhook schemas
export const KnownWebhookSchema = z.union([
  WireTransferSuccessSchema,
  WireTransferFailureSchema,
  // Add other known webhook schemas here
]);

// Define an UnknownWebhookSchema
export const UnknownWebhookSchema = z.object({
  status: z.literal("UNKNOWN_WEBHOOK"),
  rawPayload: z.unknown(),
  timestamp: z.string().datetime().optional(),
});

// Inferred TypeScript types
export type KnownWebhook = z.infer<typeof KnownWebhookSchema>;
export type UnknownWebhook = z.infer<typeof UnknownWebhookSchema>;
export type Webhook = KnownWebhook | UnknownWebhook;
