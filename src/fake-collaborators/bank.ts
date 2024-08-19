import express from "express";
import { Webhook, KnownWebhookSchema } from "../schemas/webhook-schema";
import {
  WireTransferRequest,
  WireTransferRequestSchema,
} from "../schemas/wire-transfer-request";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

const app = express();
app.use(express.json());

// Load configuration from environment variables
const port = process.env.BANK_API_PORT || 3001;
const actualChaosFactor = parseFloat(process.env.CHAOS_FACTOR || "0");

// Simulate various error responses
const simulateFailure = (chaosFactor: number) => {
  const random = Math.random();

  if (random < chaosFactor) {
    if (random < chaosFactor / 5) {
      return { status: 503, message: "Service Unavailable" }; // Bank is offline
    } else if (random < (chaosFactor / 5) * 2) {
      return { status: 401, message: "Unauthorized" }; // Bad auth
    } else if (random < (chaosFactor / 5) * 3) {
      return { status: 500, message: "Internal Server Error" }; // Internal server error
    } else if (random < (chaosFactor / 5) * 4) {
      return { status: 408, message: "Request Timeout" }; // Hanging request
    } else {
      return { status: 400, message: "Bad Request" }; // Generic bad request
    }
  }

  return null; // No failure
};

const inFlightWires: Array<WireTransferRequest> = [];

app.post("/initiate-wire", (req, res) => {
  // Use chaos factor from query parameter, or default to environment variable value
  const chaosFactor =
    parseFloat(req.query.chaosFactor as string) || actualChaosFactor;

  const failure = simulateFailure(chaosFactor);
  if (failure) {
    return res.status(failure.status).json({ error: failure.message });
  }

  const wire = WireTransferRequestSchema.parse(req.body);
  inFlightWires.push(wire);

  // Simulate successful wire transfer
  res.status(200).json({
    transactionId: req.body.transactionId,
    status: "SUCCESS",
    message: "Wire transfer initiated successfully.",
  });
});

app.listen(port, async () => {
  console.log(
    `Fake bank API listening at http://localhost:${port} with chaos factor ${actualChaosFactor}`
  );

  while (true) {
    await sleep(getRandomInt(1000, 60000));
    if (inFlightWires.length > 0) {
      const randomIndex = getRandomInt(0, inFlightWires.length - 1);
      const removedElement = inFlightWires.splice(randomIndex, 1)[0];
      await sendWebhook(removedElement);
    }
  }
});

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const sendWebhook = async (wire: WireTransferRequest): Promise<void> => {
  const webhook = webhookFromWire(wire);
  const webhookUrl = "http://localhost:3000/webhook";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhook),
    });

    if (!response.ok) {
      console.error(`Failed to send webhook: ${response.statusText}`);
    } else {
      console.log(`Successfully sent webhook for request ID: ${wire.id}`);
    }
  } catch (error) {
    console.error("Error sending webhook:", error);
  }
};

const webhookFromWire = (wire: WireTransferRequest): Webhook => {
  const shouldSucceed = Math.random() >= actualChaosFactor;
  return {
    transactionId: uuidv4(),
    requestId: wire.id,
    timestamp: new Date().toISOString(),
    ...(shouldSucceed
      ? { status: "SUCCESS" }
      : {
          status: "FAILURE",
          failureReason: faker.helpers.arrayElement([
            "INSUFFICIENT_FUNDS",
            "ACCOUNT_CLOSED",
            "ACCOUNT_NOT_FOUND",
            "NETWORK_ERROR",
            "INTERNAL_ERROR",
          ]),
        }),
  };
};
