import { PlaceHoldResponse } from "../schemas/place-hold-response-schema";
import * as activities from "../activities";
import { proxyActivities } from "@temporalio/workflow";

export const createPlaceHoldWorkflowName = (requestId: string) =>
  `place-hold-workflow-${requestId}`;

// TODO figure out if this is necessary
export async function placeHoldWorkflow(
  accountNumber: string,
  amount: number
): Promise<PlaceHoldResponse> {
  const { placeHold } = proxyActivities<typeof activities>({
    scheduleToCloseTimeout: "1 minutes",
  });

  return await placeHold({
    accountNumber,
    amount,
  });
}
