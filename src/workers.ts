import { Worker } from "@temporalio/worker";
import * as activities from "./activities";
import path from "path";

async function run() {
  // Create a single worker to handle both task queues
  const worker = await Worker.create({
    workflowsPath: require.resolve(path.join(__dirname, "./workflows")),
    taskQueue: "initiate-domestic-wire-transfer-task-queue", // Primary task queue
    activities,
  });

  // Optionally, you can add more task queues to the same worker
  const worker2 = await Worker.create({
    workflowsPath: require.resolve(path.join(__dirname, "./workflows")),
    taskQueue: "place-hold-task-queue", // Secondary task queue
    activities,
  });

  // Ensure both workers are running and awaited
  await Promise.all([worker.run(), worker2.run()]);
}

run().catch((err) => {
  console.error("Failed to run workers", err);
  process.exit(1);
});
