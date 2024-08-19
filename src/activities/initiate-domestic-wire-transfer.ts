import { match, P } from "ts-pattern";
import { ApplicationFailure } from "@temporalio/workflow";
import { WireTransferRequest } from "../schemas/wire-transfer-request";
import { StatusCodes } from "http-status-codes";
import { flow, pipe } from "fp-ts/function";
import { z } from "zod";

const InitiateDomesticWireResponseSchema = z.union([
  z.object({ error: z.string() }),
  z.object({
    status: z.literal("SUCCESS"),
    message: z.string(),
  }),
]);
type InitiateDomesticWireResponse = z.infer<
  typeof InitiateDomesticWireResponseSchema
>;

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

const handleResponse = (
  response: Response
): Promise<InitiateDomesticWireResponse> =>
  match(response)
    .with({ status: StatusCodes.OK }, async (res) => {
      const body = await res.json();
      console.log(
        `Received the banking system's response ${JSON.stringify(body, null, 2)}`
      );
      const parsed = InitiateDomesticWireResponseSchema.safeParse(body);
      if (parsed.error) {
        throw ApplicationFailure.nonRetryable(
          `Unexpected response from bank service: ${JSON.stringify(parsed.error.flatten())}`
        );
      }

      return parsed.data;
    })
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
