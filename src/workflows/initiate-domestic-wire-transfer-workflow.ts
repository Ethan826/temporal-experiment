import {
  ApplicationFailure,
  proxyActivities,
  setHandler,
  startChild,
} from "@temporalio/workflow";
import { WireTransferRequest } from "../schemas/wire-transfer-request";
import {
  wireTransferSuccessSignal,
  wireTransferFailureSignal,
} from "../signals";
import {
  createPlaceHoldWorkflowName,
  placeHoldWorkflow,
} from "./place-hold-workflow";
import { match } from "ts-pattern";
import {
  WireTransferSuccess,
  WireTransferFailure,
} from "../schemas/webhook-schema";
import * as activities from "../activities";

export const createInitiateDomesticWireTransferWorkflowName = (
  transferRequestId: string
) => `initiate-domestic-wire-transfer-${transferRequestId}`;

export async function initiateDomesticWireTransferWorkflow(
  input: WireTransferRequest,
  apiUrl = "http://localhost:3001/initiate-wire"
): Promise<WireTransferSuccess | WireTransferFailure> {
  const { initiateDomesticWireTransfer } = proxyActivities<typeof activities>({
    startToCloseTimeout: "1 minutes",
  });

  console.log("received", input);

  const placeHoldResult = await startChild(placeHoldWorkflow, {
    args: [input.senderAccount, input.amount],
    workflowId: createPlaceHoldWorkflowName(input.id),
    taskQueue: "place-hold-task-queue",
  });

  match(await placeHoldResult.result())
    .with({ response: "INSUFFICIENT_BALANCE" }, () => {
      throw ApplicationFailure.nonRetryable(
        "Insufficient balance to place hold."
      );
    })
    .with({ response: "SUCCESS" }, ({ transactionId }) => {
      console.log(
        `Hold placed successfully on account ${input.senderAccount}, transaction ${transactionId}`
      );

      return transactionId;
    })
    .with({ response: "SERVICE_UNAVAILABLE" }, () => {
      throw ApplicationFailure.retryable(
        "Service is currently unavailable, will retry..."
      );
    })
    .exhaustive();

  console.log(`Calling ${apiUrl}`);
  const sendWireResult = await initiateDomesticWireTransfer(input, apiUrl);
  console.log("Sent wire request", sendWireResult);

  return await new Promise<WireTransferSuccess | WireTransferFailure>(
    (resolve) => {
      setHandler(wireTransferSuccessSignal, (success: WireTransferSuccess) => {
        console.log("Wire transfer succeeded:", success);
        resolve(success);
      });

      setHandler(wireTransferFailureSignal, (failure: WireTransferFailure) => {
        console.log("Wire transfer failed:", failure);
        resolve(failure);
      });
    }
  );
}
