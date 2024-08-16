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
exports.initiateWireTransfer = initiateWireTransfer;
const ts_pattern_1 = require("ts-pattern");
const workflow_1 = require("@temporalio/workflow");
/**
 * Initiates a wire transfer by calling the fake bank API.
 *
 * @param wireTransferData - The data required to initiate the wire transfer.
 * @param apiUrl - The URL of the fake bank API.
 * @returns A promise resolving with the bank's response.
 *
 * @throws {TemporalFailure} If the request fails due to non-retryable errors.
 * @throws {ActivityError} For retryable errors like network issues or service unavailability.
 */
function initiateWireTransfer(wireTransferData, apiUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(wireTransferData),
        });
        return (0, ts_pattern_1.match)(response)
            .with({ status: 200 }, (res) => res.json())
            .with({ status: 503 }, () => {
            throw new workflow_1.ActivityError("Bank service unavailable, retrying...");
        })
            .with({ status: 401 }, () => {
            throw new workflow_1.TemporalFailure("Authentication failed", false);
        })
            .with({ status: ts_pattern_1.P.when((status) => status >= 400 && status < 500) }, (res) => {
            throw new workflow_1.TemporalFailure(`Client error: ${res.statusText}`, false);
        })
            .otherwise(() => {
            throw new workflow_1.TemporalFailure("Unexpected error occurred", false);
        });
    });
}
