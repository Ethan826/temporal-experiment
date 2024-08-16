import { WireTransferRequestSchema } from "./wire-transfer-request";
import * as fc from "fast-check";

describe("WireTransferRequestSchema with fast-check", () => {
  // Valid WireTransferRequest arbitrary generator
  const validRequestArbitrary = fc.record({
    transactionId: fc.uuid(),
    amount: fc
      .float({ min: 1, max: 100000 })
      .map((n) => parseFloat(n.toFixed(2))), // Ensure valid amount
    currency: fc.constant("USD"), // Currency is fixed to 'USD'
    senderAccount: fc.stringOf(fc.constantFrom(..."0123456789"), {
      minLength: 10,
      maxLength: 20,
    }), // Numeric string of 10-20 digits
    receiverAccount: fc.stringOf(fc.constantFrom(..."0123456789"), {
      minLength: 10,
      maxLength: 20,
    }), // Numeric string of 10-20 digits
    receiverName: fc.stringOf(
      fc.constantFrom(
        ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ "
      ),
      { minLength: 1, maxLength: 100 }
    ), // Only letters and spaces
    receiverBank: fc.stringOf(
      fc.constantFrom(
        ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ "
      ),
      { minLength: 1, maxLength: 100 }
    ), // Only letters and spaces
    note: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
      nil: undefined,
    }), // Optional note
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

  // Additional edge cases and invalid scenarios can be added here
});
