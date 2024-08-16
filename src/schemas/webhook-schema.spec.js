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
const zod_1 = require("zod");
const webhook_schema_1 = require("./webhook-schema");
const fc = __importStar(require("fast-check"));
describe("WebhookSchema with fast-check", () => {
    // Define a reasonable date range for the timestamp
    const dateRange = {
        min: new Date("2000-01-01T00:00:00.000Z"),
        max: new Date("2100-01-01T00:00:00.000Z"),
    };
    // Valid Webhook arbitrary generator for SUCCESS status
    const successWebhookArbitrary = fc.record({
        transactionId: fc.uuid(),
        status: fc.constant("SUCCESS"),
        comments: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
            nil: undefined,
        }),
        timestamp: fc.date(dateRange).map((d) => d.toISOString()),
        failureReason: fc.constant(undefined), // Ensure failureReason is absent
    });
    // Valid Webhook arbitrary generator for FAILURE status
    const failureWebhookArbitrary = fc.record({
        transactionId: fc.uuid(),
        status: fc.constant("FAILURE"),
        comments: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
            nil: undefined,
        }),
        timestamp: fc.date(dateRange).map((d) => d.toISOString()),
        failureReason: fc.constantFrom("INSUFFICIENT_FUNDS", "ACCOUNT_CLOSED", "ACCOUNT_NOT_FOUND", "NETWORK_ERROR", "INTERNAL_ERROR"),
    });
    it("should validate a correct SUCCESS webhook", () => {
        fc.assert(fc.property(successWebhookArbitrary, (validWebhook) => {
            webhook_schema_1.WebhookSchema.parse(validWebhook); // Should not throw
        }));
    });
    it("should validate a correct FAILURE webhook", () => {
        fc.assert(fc.property(failureWebhookArbitrary, (validWebhook) => {
            webhook_schema_1.WebhookSchema.parse(validWebhook); // Should not throw
        }));
    });
    it("should fail validation for a SUCCESS webhook with failureReason present", () => {
        const invalidWebhookArbitrary = successWebhookArbitrary.map((webhook) => (Object.assign(Object.assign({}, webhook), { failureReason: "INSUFFICIENT_FUNDS" })));
        fc.assert(fc.property(invalidWebhookArbitrary, (invalidWebhook) => {
            expect(() => webhook_schema_1.WebhookSchema.parse(invalidWebhook)).toThrow(zod_1.z.ZodError);
        }));
    });
    it("should fail validation for a FAILURE webhook with failureReason absent", () => {
        const invalidWebhookArbitrary = failureWebhookArbitrary.map((webhook) => (Object.assign(Object.assign({}, webhook), { failureReason: undefined })));
        fc.assert(fc.property(invalidWebhookArbitrary, (invalidWebhook) => {
            expect(() => webhook_schema_1.WebhookSchema.parse(invalidWebhook)).toThrow(zod_1.z.ZodError);
        }));
    });
    // Additional edge cases and invalid scenarios can be added here
});
