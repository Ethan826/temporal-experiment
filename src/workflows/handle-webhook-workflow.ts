import { match } from "ts-pattern";
import { parseWebhook } from "../activities";
import {
  ApplicationFailure,
  getExternalWorkflowHandle,
} from "@temporalio/workflow";
import { createInitiateDomesticWireTransferWorkflowName } from "./initiate-domestic-wire-transfer-workflow";
import {
  wireTransferFailureSignal,
  wireTransferSuccessSignal,
} from "../signals";

export const handleWebhookWorkflow = async (
  webhookData: unknown
): Promise<void> => {
  const parsed = await parseWebhook(webhookData);
  console.log(`Received webhook: ${JSON.stringify(parsed, null, 2)}`);

  await match(parsed)
    .with({ status: "SUCCESS" }, async (data) => {
      const workflowName = createInitiateDomesticWireTransferWorkflowName(
        data.requestId
      );
      console.log(`Looking for workflow ${workflowName}`);
      const workflowHandle = getExternalWorkflowHandle(workflowName);
      await workflowHandle.signal(wireTransferSuccessSignal, data);
    })
    .with({ status: "FAILURE" }, async (data) => {
      const workflowName = createInitiateDomesticWireTransferWorkflowName(
        data.requestId
      );
      console.log(`Looking for workflow ${workflowName}`);
      const workflowHandle = getExternalWorkflowHandle(workflowName);
      await workflowHandle.signal(wireTransferFailureSignal, data);
    })
    .with({ status: "UNKNOWN_WEBHOOK" }, (data) => {
      throw ApplicationFailure.nonRetryable(
        `Received unknown webhook: ${JSON.stringify(data)}`
      );
    })
    .exhaustive();
};
