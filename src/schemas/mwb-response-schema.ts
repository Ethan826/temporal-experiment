import { z } from "zod";

const MwbSystemStatusSchema = z.enum([
  "ACCOUNT_FROZEN",
  "FUNDS_RELEASED",
  "TRANSACTION_LEDGERED",
]);

export const MwbSystemResponseSchema = z.object({
  transactionId: z.string().uuid(),
  status: MwbSystemStatusSchema,
  message: z.string().min(1),
});

export type MwbSystemResponse = z.infer<typeof MwbSystemResponseSchema>;
