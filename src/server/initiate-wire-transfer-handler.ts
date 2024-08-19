import { v4 } from "uuid";
import { z } from "zod";
import { createInitiateDomesticWireTransferWorkflowName } from "../workflows";
import { Request, Response } from "express";
import { WorkflowClient } from "@temporalio/client";

export const WireTransferRequestSchema = z.object({
  id: z.string().uuid().optional(), // Optional if you want to generate it server-side
  amount: z.number().positive(),
  currency: z.enum(["USD", "EUR", "GBP"]),
  senderAccount: z.string().min(1),
  receiverAccount: z.string().min(1),
  receiverName: z.string().min(1),
  receiverBank: z.string().min(1),
  note: z.string().optional(),
});

export const initiateWireTransferHandler =
  (client: WorkflowClient) => async (req: Request, res: Response) => {
    const parsed = WireTransferRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(parsed.error.flatten());
    }

    const {
      amount,
      currency,
      senderAccount,
      receiverAccount,
      receiverName,
      receiverBank,
      note,
    } = parsed.data;

    try {
      const id = parsed.data.id || v4();

      // Start the Temporal workflow for wire transfer
      await client.start("initiateDomesticWireTransferWorkflow", {
        args: [
          {
            fetchImpl: fetch,
            id,
            amount,
            currency,
            senderAccount,
            receiverAccount,
            receiverName,
            receiverBank,
            note,
          },
        ],
        taskQueue: "initiate-domestic-wire-transfer-task-queue",
        workflowId: createInitiateDomesticWireTransferWorkflowName(id),
      });

      return res.status(202).json({
        transactionId: id,
        status: "PENDING",
        message: "Wire transfer initiation received. Processing...",
      });
    } catch (error) {
      console.error("Error starting workflow:", error);
      return res.status(500).json({
        error:
          "Failed to process wire transfer initiation. Please try again later.",
      });
    }
  };
