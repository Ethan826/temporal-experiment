import { v4 } from "uuid";
import { z } from "zod";
import { createInitiateDomesticWireTransferWorkflowName } from "../workflows";
import { Request, Response } from "express";
import { WorkflowClient } from "@temporalio/client";
import { WireTransferRequest } from "../schemas/wire-transfer-request";
import { StatusCodes } from "http-status-codes";

export const WireTransferRequestSchema = z.object({
  id: z.string().uuid(),
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
      return res.status(StatusCodes.BAD_REQUEST).json(parsed.error.flatten());
    }

    try {
      startWorkflow(client)(parsed.data);

      return res
        .status(StatusCodes.ACCEPTED)
        .json(createSuccessPayload(parsed.data.id));
    } catch (error) {
      console.error("Error starting workflow:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error:
          "Failed to process wire transfer initiation. Please try again later.",
      });
    }
  };

const startWorkflow =
  (client: WorkflowClient) => async (request: WireTransferRequest) => {
    await client.start("initiateDomesticWireTransferWorkflow", {
      args: [
        {
          ...request,
          fetchImpl: fetch,
        },
      ],
      taskQueue: "initiate-domestic-wire-transfer-task-queue",
      workflowId: createInitiateDomesticWireTransferWorkflowName(request.id),
    });
  };

const createSuccessPayload = (transactionId: string) => ({
  transactionId,
  status: "PENDING",
  message: "Wire transfer initiation received. Processing...",
});
