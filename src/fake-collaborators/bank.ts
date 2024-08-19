import express from "express";
import { Webhook, KnownWebhookSchema } from "../schemas/webhook-schema";
import {
  WireTransferRequest,
  WireTransferRequestSchema,
} from "../schemas/wire-transfer-request";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

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
      return {
        status: StatusCodes.SERVICE_UNAVAILABLE,
        message: "Service Unavailable",
      }; // Bank is offline
    } else if (random < (chaosFactor / 5) * 2) {
      return { status: StatusCodes.UNAUTHORIZED, message: "Unauthorized" }; // Bad auth
    } else if (random < (chaosFactor / 5) * 3) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
      }; // Internal server error
    } else if (random < (chaosFactor / 5) * 4) {
      return {
        status: StatusCodes.REQUEST_TIMEOUT,
        message: "Request Timeout",
      }; // Hanging request
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
  console.log(`Bank received a wire request ${JSON.stringify(wire)}`);

  // Simulate successful wire transfer
  res.status(StatusCodes.OK).json({
    transactionId: req.body.id,
    status: "SUCCESS",
    message: "Wire transfer initiated successfully.",
  });
});

app.listen(port, async () => {
  console.log(
    `Fake bank API listening at http://localhost:${port} with chaos factor ${actualChaosFactor}`
  );

  while (true) {
    await sleep(getRandomInt(ONE_SECOND_IN_MS, ONE_MINUTE_IN_MS));
    if (inFlightWires.length > 0) {
      const randomIndex = getRandomInt(0, inFlightWires.length - 1);
      const removedElement = inFlightWires.splice(randomIndex, 1)[0];
      await sendWebhook(removedElement);
    }
  }
});

const ONE_SECOND_IN_MS = 1000;
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60;

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const sendWebhook = async (wire: WireTransferRequest): Promise<void> => {
  const webhook = webhookFromWire(wire);
  const webhookUrl = process.env.WEBHOOK_URL || "http://localhost:3000/webhook";

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
    transactionId: v4(),
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
