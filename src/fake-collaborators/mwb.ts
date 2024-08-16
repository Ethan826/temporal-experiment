import express from "express";

const app = express();
app.use(express.json());

const port = process.env.LEGACY_SYSTEM_PORT || 3002;
const defaultChaosFactor = parseFloat(process.env.CHAOS_FACTOR || "0");

const simulateFailure = (chaosFactor: number) => {
  const random = Math.random();

  if (random < chaosFactor) {
    if (random < chaosFactor / 5) {
      return { status: 503, message: "Service Unavailable" }; // Legacy system offline
    } else if (random < (chaosFactor / 5) * 2) {
      return { status: 500, message: "Internal Server Error" }; // Internal server error
    } else if (random < (chaosFactor / 5) * 3) {
      return { status: 408, message: "Request Timeout" }; // Hanging request
    } else {
      return { status: 400, message: "Bad Request" }; // Generic bad request
    }
  }

  return null;
};

app.post("/freeze-account", (req, res) => {
  const chaosFactor =
    parseFloat(req.query.chaosFactor as string) || defaultChaosFactor;

  const failure = simulateFailure(chaosFactor);
  if (failure) {
    return res.status(failure.status).json({ error: failure.message });
  }

  res.status(200).json({
    transactionId: req.body.transactionId,
    status: "ACCOUNT_FROZEN",
    message: "Account has been successfully frozen.",
  });
});

app.post("/release-funds", (req, res) => {
  const chaosFactor =
    parseFloat(req.query.chaosFactor as string) || defaultChaosFactor;

  const failure = simulateFailure(chaosFactor);
  if (failure) {
    return res.status(failure.status).json({ error: failure.message });
  }

  res.status(200).json({
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

  res.status(200).json({
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
