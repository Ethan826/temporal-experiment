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
const faker_1 = require("@faker-js/faker");
const generateWireTransferRequest = (chaosFactor = 0) => {
    const shouldCorrupt = Math.random() < chaosFactor;
    return {
        transactionId: shouldCorrupt ? "" : faker_1.faker.string.uuid(),
        amount: shouldCorrupt
            ? -1
            : parseFloat(faker_1.faker.finance.amount({ min: 10, max: 100000, dec: 2 })),
        currency: shouldCorrupt ? "XYZ" : "USD",
        senderAccount: faker_1.faker.finance.accountNumber(),
        receiverAccount: shouldCorrupt ? "INVALID" : faker_1.faker.finance.accountNumber(),
        receiverName: faker_1.faker.person.fullName(),
        receiverBank: faker_1.faker.company.name(),
        note: faker_1.faker.lorem.sentence(),
    };
};
const sendDomesticWireRequest = (apiUrl_1, ...args_1) => __awaiter(void 0, [apiUrl_1, ...args_1], void 0, function* (apiUrl, chaosFactor = 0) {
    const payload = generateWireTransferRequest(chaosFactor);
    console.log(`Sending payload: ${JSON.stringify(payload, null, 2)}`);
    try {
        const response = yield fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = yield response.json();
        console.log(`Request sent successfully: ${response.status}`);
        console.log(`Response: `, responseData);
    }
    catch (error) {
        console.error(`Error sending request: ${error}`);
    }
});
// Example usage
const apiUrl = "http://localhost:8000/send-wire";
const chaosFactor = 0.1; // 10% chance to introduce corrupted data
sendDomesticWireRequest(apiUrl, chaosFactor);
