import {
  WireTransferRequestSchema,
  WireTransferRequest,
} from "../schemas/wire-transfer-request";

/**
 * Validates a wire transfer request using the WireTransferRequestSchema.
 *
 * @param request - The raw request data to validate.
 * @returns The validated wire transfer request.
 *
 * @throws {z.ZodError} If the request does not conform to the WireTransferRequestSchema,
 * this function will throw a ZodError containing detailed information about the validation failures.
 */
export const validateWireTransferRequest = async (
  request: any
): Promise<WireTransferRequest> => WireTransferRequestSchema.parse(request);
