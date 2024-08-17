import { z } from "zod";
import { placeHold } from "./place-hold";
import { PlaceHoldResponse } from "../schemas/place-hold-response-schema";

describe("placeHold", () => {
  let fetchSpy: jest.Mock;
  let consoleErrorSpy: jest.Mock;
  let consoleMock: Console;

  beforeEach(() => {
    fetchSpy = jest.fn();
    consoleErrorSpy = jest.fn();
    consoleMock = { ...console, error: consoleErrorSpy };
  });

  const accountNumber = "123456789";
  const amount = 1000;

  it("should successfully place a hold and return the response", async () => {
    const mockResponse: PlaceHoldResponse = {
      response: "SUCCESS",
      transactionId: "abcdef-123456",
    };

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await placeHold({
      accountNumber,
      amount,
      fetchImpl: fetchSpy,
      consoleImpl: consoleMock,
    });

    expect(fetchSpy).toHaveBeenCalledWith("http://localhost:3002/place-hold", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountNumber, amount }),
    });

    expect(result).toEqual(mockResponse);
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // Ensure no errors were logged
  });

  it("should throw an error if the fetch fails with a non-2xx status", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    });

    await expect(
      placeHold({
        accountNumber,
        amount,
        fetchImpl: fetchSpy,
        consoleImpl: consoleMock,
      })
    ).rejects.toThrow("Failed to place hold: Internal Server Error");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error placing hold:",
      expect.any(Error)
    );
  });

  it("should throw an error if the response doesn't match the schema", async () => {
    const invalidResponse = {
      response: "UNKNOWN_RESPONSE",
      transactionId: "abcdef-123456",
    };

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => invalidResponse,
    });

    await expect(
      placeHold({
        accountNumber,
        amount,
        fetchImpl: fetchSpy,
        consoleImpl: consoleMock,
      })
    ).rejects.toThrow("Invalid input");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error placing hold:",
      expect.any(z.ZodError)
    );
  });

  it("should handle a fetch failure (e.g., network error)", async () => {
    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      placeHold({
        accountNumber,
        amount,
        fetchImpl: fetchSpy,
        consoleImpl: consoleMock,
      })
    ).rejects.toThrow("Network error");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error placing hold:",
      expect.any(Error)
    );
  });
});
