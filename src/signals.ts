import { defineSignal } from "@temporalio/workflow";
import {
  WireTransferSuccess,
  WireTransferFailure,
} from "./schemas/webhook-schema";

export const wireTransferSuccessSignal = defineSignal<[WireTransferSuccess]>(
  "wireTransferSuccess"
);

export const wireTransferFailureSignal = defineSignal<[WireTransferFailure]>(
  "wireTransferFailure"
);
