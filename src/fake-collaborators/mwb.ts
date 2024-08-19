import express from "express";
import { StatusCodes } from "http-status-codes";
import { v4 } from "uuid";
import { faker } from "@faker-js/faker";

const app = express();
app.use(express.json());

const port = process.env.MWB_PORT || 3002;
const defaultChaosFactor = parseFloat(process.env.CHAOS_FACTOR || "0");

const FAILURES = [
  { status: StatusCodes.SERVICE_UNAVAILABLE, message: "Service Unavailable" },
  {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Internal Server Error",
  },
  { status: StatusCodes.REQUEST_TIMEOUT, message: "Request Timeout" },
  { status: StatusCodes.BAD_REQUEST, message: "Bad Request" },
];

const simulateFailure = (chaosFactor: number) =>
  Math.random() < chaosFactor ? faker.helpers.arrayElement(FAILURES) : null;

app.post("/place-hold", (req, res) => {
  const chaosFactor =
    parseFloat(req.query.chaosFactor as string) || defaultChaosFactor;

  const failure = simulateFailure(chaosFactor);
  if (failure) {
    return res.status(failure.status).json({ error: failure.message });
  }

  res.status(StatusCodes.OK).json({ response: "SUCCESS", transactionId: v4() });
});

app.post("/release-funds", (req, res) => {
  const chaosFactor =
    parseFloat(req.query.chaosFactor as string) || defaultChaosFactor;

  const failure = simulateFailure(chaosFactor);
  if (failure) {
    return res.status(failure.status).json({ error: failure.message });
  }

  res.status(StatusCodes.OK).json({
    transactionId: req.body.transactionId,
    status: "FUNDS_RELEASED",
    message: "Funds have been successfully released or restored.",
  });
});

app.post("/ledger-transaction", (req, res) => {
  const chaosFactor =
    parseFloat(req.query.chaosFactor as string) || defaultChaosFactor;

  const failure = simulateFailure(chaosFactor);
  if (failure) {
    return res.status(failure.status).json({ error: failure.message });
  }

  res.status(StatusCodes.OK).json({
    transactionId: req.body.transactionId,
    status: "TRANSACTION_LEDGERED",
    message: "Transaction has been successfully ledgered.",
  });
});

app.listen(port, () => {
  console.log(
    `Fake legacy system server running at http://localhost:${port} with chaos factor ${defaultChaosFactor}`
  );
});
