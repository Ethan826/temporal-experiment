import express from "express";
import { z } from "zod";
import { WorkflowClient } from "@temporalio/client";
import { v4 as uuidv4 } from "uuid";
import { handleWebhookWorkflow } from "../workflows/handle-webhook-workflow";
import { createInitiateDomesticWireTransferWorkflowName } from "../workflows";

// Initialize the Express app
const app = express();
app.use(express.json());

const port = process.env.POC_SERVER_PORT || 3000;

// Initialize the Temporal Workflow client
const client = new WorkflowClient();

const WireTransferRequestSchema = z.object({
  id: z.string().uuid().optional(), // Optional if you want to generate it server-side
  amount: z.number().positive(),
  currency: z.enum(["USD", "EUR", "GBP"]),
  senderAccount: z.string().min(1),
  receiverAccount: z.string().min(1),
  receiverName: z.string().min(1),
  receiverBank: z.string().min(1),
  note: z.string().optional(),
});

// Define the route for initiating a wire transfer
app.post("/initiate-wire-transfer", async (req, res) => {
  const parsed = WireTransferRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(parsed.error.flatten());
    return;
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
    // Use the provided transactionId or generate a new one
    // FIXIME
    const id = parsed.data.id || uuidv4();

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

    res.status(202).json({
      transactionId: id,
      status: "PENDING",
      message: "Wire transfer initiation received. Processing...",
    });
  } catch (error) {
    console.error("Error starting workflow:", error);
    res.status(500).json({
      error:
        "Failed to process wire transfer initiation. Please try again later.",
    });
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const webhookData = req.body;

    const workflowId = `webhook-${uuidv4()}`;
    await client.start(handleWebhookWorkflow, {
      args: [webhookData],
      workflowId,
      taskQueue: "webhook-task-queue", // Ensure this matches your worker setup
    });

    res.status(202).json({
      status: "PENDING",
      message: "Webhook received and is being processed.",
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({
      error: "Failed to process webhook. Please try again later.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`POC server running at http://localhost:${port}`);
});
