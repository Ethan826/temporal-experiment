import request from "supertest";
import express from "express";

// Import the code for the server setup
const app = express();
app.use(express.json());

const port = 3002;
const defaultChaosFactor = 0;

// Mock simulateFailure function for deterministic tests
const simulateFailure = jest.fn();

// Reuse the server code
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

describe("Legacy System API", () => {
  beforeAll(() => {
    // Reset simulateFailure before each test
    simulateFailure.mockReset();
  });

  it("should freeze account successfully without chaos", async () => {
    simulateFailure.mockReturnValueOnce(null);

    const response = await request(app)
      .post("/freeze-account")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      transactionId: "123e4567-e89b-12d3-a456-426614174000",
      status: "ACCOUNT_FROZEN",
      message: "Account has been successfully frozen.",
    });
  });

  it("should simulate service unavailable with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 503,
      message: "Service Unavailable",
    });

    const response = await request(app)
      .post("/freeze-account?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: "Service Unavailable",
    });
  });

  it("should release funds successfully without chaos", async () => {
    simulateFailure.mockReturnValueOnce(null);

    const response = await request(app)
      .post("/release-funds")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      transactionId: "123e4567-e89b-12d3-a456-426614174000",
      status: "FUNDS_RELEASED",
      message: "Funds have been successfully released or restored.",
    });
  });

  it("should simulate internal server error with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 500,
      message: "Internal Server Error",
    });

    const response = await request(app)
      .post("/release-funds?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Internal Server Error",
    });
  });

  it("should ledger transaction successfully without chaos", async () => {
    simulateFailure.mockReturnValueOnce(null);

    const response = await request(app)
      .post("/ledger-transaction")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      transactionId: "123e4567-e89b-12d3-a456-426614174000",
      status: "TRANSACTION_LEDGERED",
      message: "Transaction has been successfully ledgered.",
    });
  });

  it("should simulate bad request with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 400,
      message: "Bad Request",
    });

    const response = await request(app)
      .post("/ledger-transaction?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Bad Request",
    });
  });
});
