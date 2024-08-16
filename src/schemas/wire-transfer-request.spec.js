"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const wire_transfer_request_1 = require("./wire-transfer-request");
const fc = __importStar(require("fast-check"));
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
        receiverName: fc.stringOf(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ "), { minLength: 1, maxLength: 100 }), // Only letters and spaces
        receiverBank: fc.stringOf(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ "), { minLength: 1, maxLength: 100 }), // Only letters and spaces
        note: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
            nil: undefined,
        }), // Optional note
    });
    it("should always validate a correct wire transfer request", () => {
        fc.assert(fc.property(validRequestArbitrary, (validRequest) => {
            expect(wire_transfer_request_1.WireTransferRequestSchema.safeParse(validRequest).success).toBe(true);
        }));
    });
    // Additional edge cases and invalid scenarios can be added here
});
