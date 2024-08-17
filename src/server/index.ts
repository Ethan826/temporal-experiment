import express from "express";
import { z } from "zod";
import { WorkflowClient } from "@temporalio/client";
import { v4 as uuidv4 } from "uuid";

// Initialize the Express app
const app = express();
app.use(express.json());

const port = process.env.POC_SERVER_PORT || 3000;

// Initialize the Temporal Workflow client
const client = new WorkflowClient();

const WireTransferRequestSchema = z.object({
  transactionId: z.string().uuid().optional(), // Optional if you want to generate it server-side
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
    const transactionId = parsed.data.transactionId || uuidv4();

    // Start the Temporal workflow for wire transfer
    await client.start("initiateDomesticWireTransferWorkflow", {
      args: [
        {
          transactionId,
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
      workflowId: transactionId, // Use the transactionId as the workflowId
    });

    res.status(202).json({
      transactionId,
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

// Start the server
app.listen(port, () => {
  console.log(`POC server running at http://localhost:${port}`);
});
