import { match, P } from "ts-pattern";
import { ApplicationFailure } from "@temporalio/workflow";

/**
 * Initiates a wire transfer by calling the fake bank API.
 *
 * @param wireTransferData - The data required to initiate the wire transfer.
 * @param apiUrl - The URL of the fake bank API.
 * @returns A promise resolving with the bank's response.
 *
 * @throws {ApplicationFailure} For retryable and non-retryable errors.
 */
export async function initiateWireTransfer(
  wireTransferData: any,
  apiUrl: string
): Promise<any> {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(wireTransferData),
  });

  return match(response)
    .with({ status: 200 }, (res) => res.json())
    .with({ status: 503 }, () => {
      throw new ApplicationFailure(
        "Bank service unavailable, retrying...",
        null,
        false
      );
    })
    .with({ status: 401 }, () => {
      throw new ApplicationFailure("Authentication failed", null, true);
    })
    .with(
      { status: P.when((status) => status >= 400 && status < 500) },
      (res) => {
        throw new ApplicationFailure(
          `Client error: ${res.statusText}`,
          null,
          true
        );
      }
    )
    .otherwise(() => {
      throw new ApplicationFailure("Unexpected error occurred", null, true);
    });
}
