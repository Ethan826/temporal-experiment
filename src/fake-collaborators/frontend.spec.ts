import {
  generateWireTransferRequest,
  sendDomesticWireRequest,
} from "./frontend";

describe("generateWireTransferRequest", () => {
  it("should generate a valid wire transfer request without chaos", () => {
    const request = generateWireTransferRequest(0);

    expect(request.transactionId).toMatch(/^[0-9a-fA-F-]{36}$/);
    expect(request.amount).toBeGreaterThanOrEqual(10);
    expect(request.amount).toBeLessThanOrEqual(100_000);
    expect(request.currency).toBe("USD");
    expect(request.senderAccount).toBeTruthy();
    expect(request.receiverAccount).toBeTruthy();
    expect(request.receiverName).toBeTruthy();
    expect(request.receiverBank).toBeTruthy();
    expect(request.note).toBeTruthy();
  });

  it("should generate an invalid wire transfer request with chaos", () => {
    const request = generateWireTransferRequest(1);

    expect(request.transactionId).toBe("");
    expect(request.amount).toBe(-1);
    expect(request.currency).toBe("XYZ");
    expect(request.receiverAccount).toBe("INVALID");
  });
});

describe("sendDomesticWireRequest", () => {
  let fetchSpy: jest.Mock;
  let logSpy: jest.Mock;
  let errorSpy: jest.Mock;
  let consoleMock: Console;

  beforeEach(() => {
    fetchSpy = jest.fn();
    logSpy = jest.fn();
    errorSpy = jest.fn();
    consoleMock = { ...console, log: logSpy, error: errorSpy };
  });

  it("should send a valid request successfully", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const apiUrl = "http://localhost:8000/send-wire";
    await sendDomesticWireRequest(apiUrl, 0, fetchSpy, consoleMock);

    expect(fetchSpy).toHaveBeenCalledWith(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: expect.any(String),
    });

    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(requestBody.transactionId).toMatch(/^[0-9a-fA-F-]{36}$/);
    expect(requestBody.amount).toBeGreaterThanOrEqual(10);
    expect(requestBody.amount).toBeLessThanOrEqual(100_000);
    expect(requestBody.currency).toBe("USD");
  });

  it("should handle an HTTP error response", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const apiUrl = "http://localhost:8000/send-wire";

    await expect(
      sendDomesticWireRequest(apiUrl, 0, fetchSpy, consoleMock)
    ).rejects.toThrow("HTTP error! status: 500");
  });

  it("should log an error if the fetch fails", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    const apiUrl = "http://localhost:8000/send-wire";
    await expect(
      sendDomesticWireRequest(apiUrl, 0, fetchSpy, consoleMock)
    ).rejects.toThrow("Network error");

    expect(errorSpy).toHaveBeenCalledWith(
      "Error sending request: Error: Network error"
    );
  });

  it("should send an invalid request with chaos factor", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false }),
    });

    const apiUrl = "http://localhost:8000/send-wire";
    await expect(
      sendDomesticWireRequest(apiUrl, 1, fetchSpy, consoleMock)
    ).rejects.toThrow("HTTP error! status: 400");

    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(requestBody.transactionId).toBe("");
    expect(requestBody.amount).toBe(-1);
    expect(requestBody.currency).toBe("XYZ");
    expect(requestBody.receiverAccount).toBe("INVALID");
  });
});
