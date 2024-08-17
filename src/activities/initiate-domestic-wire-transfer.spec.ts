import { initiateDomesticWireTransfer } from "./initiate-domestic-wire-transfer";
import { ApplicationFailure } from "@temporalio/workflow";

describe("initiateDomesticWireTransfer", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
  });

  const apiUrl = "http://localhost:8000/initiate-wire";
  const wireTransferData = {
    transactionId: "123e4567-e89b-12d3-a456-426614174000",
    amount: 1000,
    currency: "USD",
    senderAccount: "12345678",
    receiverAccount: "87654321",
    receiverName: "John Doe",
    receiverBank: "Bank of Tests",
    note: "Test transfer",
  } as const;

  it("should successfully initiate a wire transfer", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        success: true,
        transactionId: wireTransferData.transactionId,
      }),
    });

    const result = await initiateDomesticWireTransfer(
      wireTransferData,
      apiUrl,
      fetchMock
    );

    expect(fetchMock).toHaveBeenCalledWith(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wireTransferData),
    });

    expect(result).toEqual({
      success: true,
      transactionId: wireTransferData.transactionId,
    });
  });

  it("should throw ApplicationFailure for 503 Service Unavailable", async () => {
    fetchMock.mockResolvedValueOnce({ status: 503 });

    const promise = initiateDomesticWireTransfer(
      wireTransferData,
      apiUrl,
      fetchMock
    );

    await expect(promise).rejects.toThrow(ApplicationFailure);
    await expect(promise).rejects.toMatchObject({
      message: "Bank service unavailable, retrying...",
      nonRetryable: false,
    });
  });

  it("should throw ApplicationFailure for 401 Unauthorized", async () => {
    fetchMock.mockResolvedValueOnce({ status: 401 });

    const promise = initiateDomesticWireTransfer(
      wireTransferData,
      apiUrl,
      fetchMock
    );

    await expect(promise).rejects.toThrow(ApplicationFailure);
    await expect(promise).rejects.toMatchObject({
      message: "Authentication failed",
      nonRetryable: true,
    });
  });

  it("should throw ApplicationFailure for client errors (400-499)", async () => {
    fetchMock.mockResolvedValueOnce({ status: 400, statusText: "Bad Request" });

    const promise = initiateDomesticWireTransfer(
      wireTransferData,
      apiUrl,
      fetchMock
    );

    await expect(promise).rejects.toThrow(ApplicationFailure);
    await expect(promise).rejects.toMatchObject({
      message: "Client error: Bad Request",
      nonRetryable: true,
    });
  });

  it("should throw ApplicationFailure for unexpected errors", async () => {
    fetchMock.mockResolvedValueOnce({ status: 500 });

    const promise = initiateDomesticWireTransfer(
      wireTransferData,
      apiUrl,
      fetchMock
    );

    await expect(promise).rejects.toThrow(ApplicationFailure);
    await expect(promise).rejects.toMatchObject({
      message: "Unexpected error occurred",
      nonRetryable: true,
    });
  });
});
