import { match, P } from "ts-pattern";
import { ApplicationFailure } from "@temporalio/workflow";
import { WireTransferRequest } from "../schemas/wire-transfer-request";
import { StatusCodes } from "http-status-codes";

export type InitiateDomesticWireResponse = {
  id: string;
};

/**
 * Initiates a wire transfer by calling the fake bank API.
 *
 * @param wireTransferRequest - The data required to initiate the wire transfer.
 * @param apiUrl - The URL of the fake bank API.
 * @param fetchImpl - The fetch implementation to use (default: global fetch).
 * @returns A promise resolving with the bank's response.
 *
 * @throws {ApplicationFailure} For retryable and non-retryable errors.
 */
export const initiateDomesticWireTransfer = async (
  wireTransferRequest: WireTransferRequest,
  apiUrl: string,
  fetchImpl: typeof fetch = global.fetch
): Promise<InitiateDomesticWireResponse> => {
  const response = await fetchImpl(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(wireTransferRequest),
  });

  return handleResponse(response);
};

const handleResponse = <B>(response: Response): Promise<B> =>
  match(response)
    .with({ status: StatusCodes.OK }, (res) => res.json())
    .with({ status: StatusCodes.SERVICE_UNAVAILABLE }, () => {
      throw ApplicationFailure.retryable(
        "Bank service unavailable, retrying..."
      );
    })
    .with({ status: StatusCodes.UNAUTHORIZED }, () => {
      throw ApplicationFailure.nonRetryable("Authentication failed");
    })
    .with(
      { status: P.when((status) => status >= 400 && status < 500) },
      (res) => {
        throw ApplicationFailure.nonRetryable(
          `Client error: ${res.statusText}`
        );
      }
    )
    .otherwise(() => {
      throw ApplicationFailure.nonRetryable("Unexpected error occurred");
    });
