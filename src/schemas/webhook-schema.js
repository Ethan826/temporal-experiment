"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookSchema = void 0;
const zod_1 = require("zod");
// Define the possible failure reasons if the status is 'FAILURE'
const FailureReasonSchema = zod_1.z.enum([
    "INSUFFICIENT_FUNDS",
    "ACCOUNT_CLOSED",
    "ACCOUNT_NOT_FOUND",
    "NETWORK_ERROR",
    "INTERNAL_ERROR",
]);
// Shared properties for both success and failure cases
const sharedProperties = {
    transactionId: zod_1.z.string().uuid(),
    timestamp: zod_1.z.string().datetime(),
    comments: zod_1.z.string().optional(),
};
// Define the Webhook schema with a union type
exports.WebhookSchema = zod_1.z.union([
    zod_1.z.object(Object.assign(Object.assign({}, sharedProperties), { status: zod_1.z.literal("SUCCESS"), failureReason: zod_1.z.undefined() })),
    zod_1.z.object(Object.assign(Object.assign({}, sharedProperties), { status: zod_1.z.literal("FAILURE"), failureReason: FailureReasonSchema })),
]);
