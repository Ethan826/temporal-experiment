import express from "express";
import { WorkflowClient } from "@temporalio/client"; // Assuming you have the Temporal client installed
import { v4 as uuidv4 } from "uuid";

// Initialize the Express app
const app = express();
app.use(express.json());

const port = process.env.POC_SERVER_PORT || 3000;

// Initialize the Temporal Workflow client
const client = new WorkflowClient();

// Define the route for initiating a wire transfer
app.post("/request-wire-transfer", async (req, res) => {
  const {
    amount,
    currency,
    senderAccount,
    receiverAccount,
    receiverName,
    receiverBank,
    note,
  } = req.body;

  try {
    // Generate a unique transaction ID
    const transactionId = uuidv4();

    // Start the Temporal workflow for wire transfer
    const handle = await client.start("wireTransferWorkflow", {
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
      taskQueue: "wire-transfer-task-queue",
      workflowId: transactionId,
    });

    res.status(202).json({
      transactionId,
      status: "PENDING",
      message: "Wire transfer request received. Processing...",
    });
  } catch (error) {
    console.error("Error starting workflow:", error);
    res.status(500).json({
      error: "Failed to process wire transfer request. Please try again later.",
    });
  }
});

// Define the route to receive webhooks
app.post("/webhook", async (req, res) => {
  const { transactionId, status } = req.body;

  try {
    // Signal the Temporal workflow with the webhook data
    await client.signalWorkflow("wireTransferWorkflow", {
      signalName: "updateStatus",
      workflowId: transactionId,
      args: [status],
    });

    res
      .status(200)
      .json({ message: "Webhook received and processed successfully." });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Failed to process webhook. Please try again later.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`POC server running at http://localhost:${port}`);
});
