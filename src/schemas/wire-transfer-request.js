"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WireTransferRequestSchema = void 0;
const zod_1 = require("zod");
exports.WireTransferRequestSchema = zod_1.z.object({
    transactionId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive().max(100000),
    currency: zod_1.z.enum(["USD"]),
    senderAccount: zod_1.z.string().min(10).max(20),
    receiverAccount: zod_1.z.string().min(10).max(20),
    receiverName: zod_1.z.string().min(1),
    receiverBank: zod_1.z.string().min(1),
    note: zod_1.z.string().optional(),
});
