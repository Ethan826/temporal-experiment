import { faker } from "@faker-js/faker";

interface WireTransferRequest {
  transactionId: string;
  amount: number;
  currency: string;
  senderAccount: string;
  receiverAccount: string;
  receiverName: string;
  receiverBank: string;
  note: string;
}

const generateWireTransferRequest = (
  chaosFactor: number = 0
): WireTransferRequest => {
  const shouldCorrupt = Math.random() < chaosFactor;

  return {
    transactionId: shouldCorrupt ? "" : faker.string.uuid(),
    amount: shouldCorrupt
      ? -1
      : parseFloat(faker.finance.amount({ min: 10, max: 100_000, dec: 2 })),
    currency: shouldCorrupt ? "XYZ" : "USD",
    senderAccount: faker.finance.accountNumber(),
    receiverAccount: shouldCorrupt ? "INVALID" : faker.finance.accountNumber(),
    receiverName: faker.person.fullName(),
    receiverBank: faker.company.name(),
    note: faker.lorem.sentence(),
  };
};

const sendDomesticWireRequest = async (
  apiUrl: string,
  chaosFactor: number = 0
) => {
  const payload = generateWireTransferRequest(chaosFactor);

  console.log(`Sending payload: ${JSON.stringify(payload, null, 2)}`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`Request sent successfully: ${response.status}`);
    console.log(`Response: `, responseData);
  } catch (error) {
    console.error(`Error sending request: ${error}`);
  }
};

// Example usage
const apiUrl = "http://localhost:8000/send-wire";
const chaosFactor = 0.1; // 10% chance to introduce corrupted data
sendDomesticWireRequest(apiUrl, chaosFactor);
