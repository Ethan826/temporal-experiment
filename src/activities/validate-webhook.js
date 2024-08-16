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
exports.parseWebhook = void 0;
const webhook_schema_1 = require("../schemas/webhook-schema");
/**
 * Activity function to parse and validate a webhook.
 *
 * @param webhookData - The raw webhook data to validate and parse.
 * @returns The parsed Webhook object.
 *
 * @throws {z.ZodError} If the webhook data does not conform to the WebhookSchema,
 * this function will throw a ZodError containing detailed information about the validation failures.
 */
const parseWebhook = (webhookData) => __awaiter(void 0, void 0, void 0, function* () { return webhook_schema_1.WebhookSchema.parse(webhookData); });
exports.parseWebhook = parseWebhook;
