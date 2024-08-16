import { z } from "zod";

// Define the possible failure reasons if the status is 'FAILURE'
const FailureReasonSchema = z.enum([
  "INSUFFICIENT_FUNDS",
  "ACCOUNT_CLOSED",
  "ACCOUNT_NOT_FOUND",
  "NETWORK_ERROR",
  "INTERNAL_ERROR",
]);

// Shared properties for both success and failure cases
const sharedProperties = {
  transactionId: z.string().uuid(),
  timestamp: z.string().datetime(),
  comments: z.string().optional(),
};

// Define the Webhook schema with a union type
export const WebhookSchema = z.union([
  z.object({
    ...sharedProperties,
    status: z.literal("SUCCESS"),
    failureReason: z.undefined(), // failureReason must be absent
  }),
  z.object({
    ...sharedProperties,
    status: z.literal("FAILURE"),
    failureReason: FailureReasonSchema, // failureReason must be present
  }),
]);

// Inferred TypeScript type
export type Webhook = z.infer<typeof WebhookSchema>;
