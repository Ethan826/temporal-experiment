"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@temporalio/client"); // Assuming you have the Temporal client installed
const uuid_1 = require("uuid");
// Initialize the Express app
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.POC_SERVER_PORT || 3000;
// Initialize the Temporal Workflow client
const client = new client_1.WorkflowClient();
// Define the route for initiating a wire transfer
app.post("/request-wire-transfer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, currency, senderAccount, receiverAccount, receiverName, receiverBank, note, } = req.body;
    try {
        // Generate a unique transaction ID
        const transactionId = (0, uuid_1.v4)();
        // Start the Temporal workflow for wire transfer
        const handle = yield client.start("wireTransferWorkflow", {
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
    }
    catch (error) {
        console.error("Error starting workflow:", error);
        res.status(500).json({
            error: "Failed to process wire transfer request. Please try again later.",
        });
    }
}));
// Define the route to receive webhooks
app.post("/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId, status } = req.body;
    try {
        // Signal the Temporal workflow with the webhook data
        yield client.signalWorkflow("wireTransferWorkflow", {
            signalName: "updateStatus",
            workflowId: transactionId,
            args: [status],
        });
        res
            .status(200)
            .json({ message: "Webhook received and processed successfully." });
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({
            error: "Failed to process webhook. Please try again later.",
        });
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`POC server running at http://localhost:${port}`);
});
