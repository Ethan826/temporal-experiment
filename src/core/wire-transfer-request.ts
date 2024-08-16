import { z } from "zod";

export const WireTransferRequestSchema = z.object({
  transactionId: z.string().uuid(),
  amount: z.number().positive().max(100000),
  currency: z.enum(["USD"]),
  senderAccount: z.string().min(10).max(20),
  receiverAccount: z.string().min(10).max(20),
  receiverName: z.string().min(1),
  receiverBank: z.string().min(1),
  note: z.string().optional(),
});

export type WireTransferRequest = z.infer<typeof WireTransferRequestSchema>;
