"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWireTransferRequest = void 0;
const wire_transfer_request_1 = require("../schemas/wire-transfer-request");
/**
 * Validates a wire transfer request using the WireTransferRequestSchema.
 *
 * @param request - The raw request data to validate.
 * @returns The validated wire transfer request.
 *
 * @throws {z.ZodError} If the request does not conform to the WireTransferRequestSchema,
 * this function will throw a ZodError containing detailed information about the validation failures.
 */
const validateWireTransferRequest = (request) => __awaiter(void 0, void 0, void 0, function* () { return wire_transfer_request_1.WireTransferRequestSchema.parse(request); });
exports.validateWireTransferRequest = validateWireTransferRequest;
