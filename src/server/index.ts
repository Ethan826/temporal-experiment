import express from "express";
import { webhookHandler } from "./webhook-handler";
import { initiateWireTransferHandler } from "./initiate-wire-transfer-handler";
import { WorkflowClient } from "@temporalio/client";

const app = express();
app.use(express.json());
const client = new WorkflowClient();

const port = process.env.POC_SERVER_PORT || 3000;

app.post("/initiate-wire-transfer", initiateWireTransferHandler(client));
app.post("/webhook", webhookHandler(client));

app.listen(port, () => {
  console.log(`POC server running at http://localhost:${port}`);
});
