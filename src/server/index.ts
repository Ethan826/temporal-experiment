import express from "express";
import { webhookHandler } from "./webhook-handler";
import { initiateWireTransferHandler } from "./initiate-wire-transfer-handler";
import { WorkflowClient } from "@temporalio/client";

// Initialize the Express app
const app = express();
app.use(express.json());
const client = new WorkflowClient();

const port = process.env.POC_SERVER_PORT || 3000;

// Define the routes and attach the handlers
app.post("/initiate-wire-transfer", initiateWireTransferHandler(client));
app.post("/webhook", webhookHandler(client));

// Start the server
app.listen(port, () => {
  console.log(`POC server running at http://localhost:${port}`);
});
