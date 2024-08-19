import { v4 } from "uuid";
import { handleWebhookWorkflow } from "../workflows";
import { Request, Response } from "express";
import { WorkflowClient } from "@temporalio/client";

const createWebhookWorkflowName = () => `webhook-${v4()}`;

export const webhookHandler =
  (client: WorkflowClient) =>
  async ({ body }: Request, res: Response) => {
    try {
      const workflowId = createWebhookWorkflowName();
      await client.start(handleWebhookWorkflow, {
        args: [body],
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
