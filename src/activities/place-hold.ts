import {
  PlaceHoldResponse,
  PlaceHoldResponseSchema,
} from "../schemas/place-hold-response-schema";

export const placeHold = async (
  accountNumber: string,
  amount: number,
  fetchImpl: typeof fetch = globalThis.fetch,
  consoleImpl: Console = console
): Promise<PlaceHoldResponse> => {
  const apiUrl = process.env.MWB_BACKEND_URL || "http://localhost:3002";
  const endpoint = `${apiUrl}/place-hold`;

  try {
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
