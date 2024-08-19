# temporal-experiment

The initiation workflow places a hold on the sender's account, then calls the fake bank API in an activity, waiting for a success/failure signal. Another workflow parses webhooks from the bank and signals the first workflow using an ID from the client request ID. All the components are fakes.

## Running

* `yarn start`: server on 3000, fake bank on 3001, fake MWB on 3002 (also launches Temporal workers). You need a Temporal server running locally.
* `yarn test`

## Known gaps

- The wire request doesn't have an idempotency key, so an activity retry could send the wire twice.
- The only retry is for 503s.
- The HTTP returns a 202 right away, before confirming the workflow started.
- If the webhook doesn't arrive, the workflow waits forever.
