import { v4 } from "uuid";
import { handleWebhookWorkflow } from "../workflows";
import { Request, Response } from "express";
import { WorkflowClient } from "@temporalio/client";

export const webhookHandler =
  (client: WorkflowClient) => async (req: Request, res: Response) => {
    try {
      const webhookData = req.body;

      const workflowId = `webhook-${v4()}`;
      await client.start(handleWebhookWorkflow, {
        args: [webhookData],
        workflowId,
        taskQueue: "webhook-task-queue", // Ensure this matches your worker setup
      });

      return res.status(202).json({
        status: "PENDING",
        message: "Webhook received and is being processed.",
      });
    } catch (error) {
      console.error("Error handling webhook:", error);
      return res.status(500).json({
        error: "Failed to process webhook. Please try again later.",
      });
    }
  };
