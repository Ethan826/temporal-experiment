import {
  PlaceHoldResponse,
  PlaceHoldResponseSchema,
} from "../schemas/place-hold-response-schema";

export type PlaceHoldRequest = {
  accountNumber: string;
  amount: number;
  fetchImpl?: typeof fetch;
  apiUrl?: string;
  consoleImpl?: Console;
};

const DEFAULTS: Required<
  Pick<PlaceHoldRequest, "apiUrl" | "consoleImpl" | "fetchImpl">
> = {
  apiUrl: "http://localhost:3002",
  consoleImpl: console,
  fetchImpl: global.fetch,
};

export const placeHold = async (
  req: PlaceHoldRequest
): Promise<PlaceHoldResponse> => {
  const { apiUrl, fetchImpl, consoleImpl, accountNumber, amount } = {
    ...DEFAULTS,
    ...req,
  };

  const endpoint = `${apiUrl}/place-hold`;

  try {
    console.log(`Trying to call ${endpoint} to place hold`);

    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountNumber, amount }),
    });

    if (!response.ok) {
      throw new Error(`Failed to place hold: ${response.statusText}`);
    }

    const responseData = await response.json();

    // Validate the response against the schema
    const parsedResponse = PlaceHoldResponseSchema.parse(responseData);

    return parsedResponse;
  } catch (error) {
    consoleImpl.error("Error placing hold:", error);
    throw error;
  }
};
