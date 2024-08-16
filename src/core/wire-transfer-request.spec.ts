import { z } from "zod";
import { WireTransferRequestSchema } from "./wire-transfer-request";
import * as fc from "fast-check";

describe("WireTransferRequestSchema with fast-check", () => {
  const validRequestArbitrary = fc.record({
    transactionId: fc.uuid(),
    amount: fc
      .float({ min: 1, max: 100000 })
      .map((n) => parseFloat(n.toFixed(2))),
    currency: fc.constantFrom("USD"),
    senderAccount: fc.string({
      minLength: 10,
      maxLength: 20,
    }),
    receiverAccount: fc.string({
      minLength: 10,
      maxLength: 20,
    }),
    receiverName: fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0),
    receiverBank: fc
      .string({ minLength: 1, maxLength: 100 })
      .filter((s) => s.trim().length > 0),
    note: fc.option(
      fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
      { nil: undefined }
    ),
  });

  it("should always validate a correct wire transfer request", () => {
    fc.assert(
      fc.property(validRequestArbitrary, (validRequest) => {
        expect(WireTransferRequestSchema.safeParse(validRequest).success).toBe(
          true
        );
      })
    );
  });

  it("should fail validation for a negative amount", () => {
    const invalidAmountArbitrary = validRequestArbitrary.map((request) => ({
      ...request,
      amount: -1 * Math.abs(request.amount),
    }));

    fc.assert(
      fc.property(invalidAmountArbitrary, (invalidRequest) => {
        expect(
          WireTransferRequestSchema.safeParse(invalidRequest).success
        ).toBe(false);
      })
    );
  });

  it("should fail validation for an invalid UUID", () => {
    const invalidUuidArbitrary = validRequestArbitrary.map((request) => ({
      ...request,
      transactionId: "invalid-uuid",
    }));

    fc.assert(
      fc.property(invalidUuidArbitrary, (invalidRequest) => {
        expect(
          WireTransferRequestSchema.safeParse(invalidRequest).success
        ).toBe(false);
      })
    );
  });

  it("should fail validation for an unsupported currency", () => {
    const invalidCurrencyArbitrary = validRequestArbitrary.map((request) => ({
      ...request,
      currency: "EUR",
    }));

    fc.assert(
      fc.property(invalidCurrencyArbitrary, (invalidRequest) => {
        expect(
          WireTransferRequestSchema.safeParse(invalidRequest).success
        ).toBe(false);
      })
    );
  });

  it("should fail validation for an empty receiver name", () => {
    const invalidReceiverNameArbitrary = validRequestArbitrary.map(
      (request) => ({
        ...request,
        receiverName: "",
      })
    );

    fc.assert(
      fc.property(invalidReceiverNameArbitrary, (invalidRequest) => {
        expect(
          WireTransferRequestSchema.safeParse(invalidRequest).success
        ).toBe(false);
      })
    );
  });
});
