import request from "supertest";
import express from "express";

// Import the server code
const app = express();
app.use(express.json());

const port = 3001;
const defaultChaosFactor = 0;

// Mock simulateFailure function for deterministic tests
const simulateFailure = jest.fn();

// Reuse the server code
app.post("/initiate-wire", (req, res) => {
  const chaosFactor =
    parseFloat(req.query.chaosFactor as string) || defaultChaosFactor;

  const failure = simulateFailure(chaosFactor);
  if (failure) {
    return res.status(failure.status).json({ error: failure.message });
  }

  res.status(200).json({
    transactionId: req.body.transactionId,
    status: "SUCCESS",
    message: "Wire transfer initiated successfully.",
  });
});

describe("Bank API", () => {
  beforeAll(() => {
    // Mock the simulateFailure function
    jest.mock("./bank", () => simulateFailure);
  });

  afterEach(() => {
    // Clear mock after each test
    simulateFailure.mockReset();
  });

  it("should initiate a wire transfer successfully without chaos", async () => {
    simulateFailure.mockReturnValueOnce(null);

    const response = await request(app)
      .post("/initiate-wire")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      transactionId: "123e4567-e89b-12d3-a456-426614174000",
      status: "SUCCESS",
      message: "Wire transfer initiated successfully.",
    });
  });

  it("should simulate service unavailable with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 503,
      message: "Service Unavailable",
    });

    const response = await request(app)
      .post("/initiate-wire?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: "Service Unavailable" });
  });

  it("should simulate unauthorized error with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 401,
      message: "Unauthorized",
    });

    const response = await request(app)
      .post("/initiate-wire?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("should simulate internal server error with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 500,
      message: "Internal Server Error",
    });

    const response = await request(app)
      .post("/initiate-wire?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });

  it("should simulate request timeout with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 408,
      message: "Request Timeout",
    });

    const response = await request(app)
      .post("/initiate-wire?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(408);
    expect(response.body).toEqual({ error: "Request Timeout" });
  });

  it("should simulate bad request with chaos factor", async () => {
    simulateFailure.mockReturnValueOnce({
      status: 400,
      message: "Bad Request",
    });

    const response = await request(app)
      .post("/initiate-wire?chaosFactor=1")
      .send({ transactionId: "123e4567-e89b-12d3-a456-426614174000" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Bad Request" });
  });
});
