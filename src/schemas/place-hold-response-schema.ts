import { z } from "zod";

/**
 * Represents the response from MWB when placing a hold on an account on our
 * ledger.
 */
export const PlaceHoldResponseSchema = z.union([
  z.object({ response: z.literal("SUCCESS"), transactionId: z.string() }),
  z.object({ response: z.literal("INSUFFICIENT_BALANCE") }),
  z.object({ response: z.literal("SERVICE_UNAVAILABLE") }),
  // More variants can be added here if needed
]);

export type PlaceHoldResponse = z.infer<typeof PlaceHoldResponseSchema>;
