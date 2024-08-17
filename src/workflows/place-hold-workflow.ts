import { PlaceHoldResponse } from "../schemas/place-hold-response-schema";
import { placeHold } from "../activities/place-hold";

// TODO figure out if this is necessary
export async function placeHoldWorkflow(
  accountNumber: string,
  amount: number
): Promise<PlaceHoldResponse> {
  return await placeHold(accountNumber, amount);
}
