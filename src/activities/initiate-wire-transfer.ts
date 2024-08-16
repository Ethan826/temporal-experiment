import { match, P } from "ts-pattern";
import { ApplicationFailure } from "@temporalio/workflow";

/**
 * Initiates a wire transfer by calling the fake bank API.
 *
 * @param T - The data required to initiate the wire transfer.
 * @param apiUrl - The URL of the fake bank API.
 * @param fetchImpl - The fetch implementation to use (default: global fetch).
 * @returns A promise resolving with the bank's response.
 *
 * @throws {ApplicationFailure} For retryable and non-retryable errors.
 */
export const initiateWireTransfer = async <T>(
  wireTransferData: T,
  apiUrl: string,
  fetchImpl: typeof fetch = global.fetch
): Promise<any> => {
  const response = await fetchImpl(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(wireTransferData),
  });

  return handleResponse(response);
};

const handleResponse = (response: Response) =>
  match(response)
    .with({ status: 200 }, (res) => res.json())
    .with({ status: 503 }, () => {
      throw ApplicationFailure.retryable(
        "Bank service unavailable, retrying..."
      );
    })
    .with({ status: 401 }, () => {
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
