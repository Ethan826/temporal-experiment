"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Load configuration from environment variables
const port = process.env.BANK_API_PORT || 3001;
const defaultChaosFactor = parseFloat(process.env.CHAOS_FACTOR || "0");
// Simulate various error responses
const simulateFailure = (chaosFactor) => {
    const random = Math.random();
    if (random < chaosFactor) {
        if (random < chaosFactor / 5) {
            return { status: 503, message: "Service Unavailable" }; // Bank is offline
        }
        else if (random < (chaosFactor / 5) * 2) {
            return { status: 401, message: "Unauthorized" }; // Bad auth
        }
        else if (random < (chaosFactor / 5) * 3) {
            return { status: 500, message: "Internal Server Error" }; // Internal server error
        }
        else if (random < (chaosFactor / 5) * 4) {
            return { status: 408, message: "Request Timeout" }; // Hanging request
        }
        else {
            return { status: 400, message: "Bad Request" }; // Generic bad request
        }
    }
    return null; // No failure
};
app.post("/initiate-wire", (req, res) => {
    // Use chaos factor from query parameter, or default to environment variable value
    const chaosFactor = parseFloat(req.query.chaosFactor) || defaultChaosFactor;
    const failure = simulateFailure(chaosFactor);
    if (failure) {
        return res.status(failure.status).json({ error: failure.message });
    }
    // Simulate successful wire transfer
    res.status(200).json({
        transactionId: req.body.transactionId,
        status: "SUCCESS",
        message: "Wire transfer initiated successfully.",
    });
});
app.listen(port, () => {
    console.log(`Fake bank API listening at http://localhost:${port} with chaos factor ${defaultChaosFactor}`);
});
