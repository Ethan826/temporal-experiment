import { MwbSystemResponseSchema } from "./mwb-response-schema";
import { z } from "zod";
import * as fc from "fast-check";

describe("MwbSystemResponseSchema with fast-check", () => {
  // Valid MwbSystemResponse arbitrary generator
  const validResponseArbitrary = fc.record({
    transactionId: fc.uuid(),
    status: fc.constantFrom(
      "ACCOUNT_FROZEN",
      "FUNDS_RELEASED",
      "TRANSACTION_LEDGERED"
    ),
    message: fc.string({ minLength: 1, maxLength: 200 }),
  });

  it("should validate a correct Mwb system response", () => {
    fc.assert(
      fc.property(validResponseArbitrary, (validResponse) => {
        expect(MwbSystemResponseSchema.safeParse(validResponse).success).toBe(
          true
        );
      })
    );
  });

  it("should fail validation for an invalid UUID", () => {
    const invalidUuidArbitrary = validResponseArbitrary.map((response) => ({
      ...response,
      transactionId: "invalid-uuid",
    }));

    fc.assert(
      fc.property(invalidUuidArbitrary, (invalidResponse) => {
        expect(() => MwbSystemResponseSchema.parse(invalidResponse)).toThrow(
          z.ZodError
        );
      })
    );
  });

  it("should fail validation for an unsupported status", () => {
    const invalidStatusArbitrary = validResponseArbitrary.map((response) => ({
      ...response,
      status: "INVALID_STATUS",
    }));

    fc.assert(
      fc.property(invalidStatusArbitrary, (invalidResponse) => {
        expect(() => MwbSystemResponseSchema.parse(invalidResponse)).toThrow(
          z.ZodError
        );
      })
    );
  });

  it("should fail validation for an empty message", () => {
    const invalidMessageArbitrary = validResponseArbitrary.map((response) => ({
      ...response,
      message: "",
    }));

    fc.assert(
      fc.property(invalidMessageArbitrary, (invalidResponse) => {
        expect(() => MwbSystemResponseSchema.parse(invalidResponse)).toThrow(
          z.ZodError
        );
      })
    );
  });

  // Add more test cases as needed to cover all edge cases and possible inputs
});
