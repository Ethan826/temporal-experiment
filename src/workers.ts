import { Worker } from "@temporalio/worker";
import * as activities from "./activities";
import path from "path";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve(path.join(__dirname, "./workflows")),
    taskQueue: "initiate-domestic-wire-transfer-task-queue", // Primary task queue
    activities,
  });

  const worker2 = await Worker.create({
    workflowsPath: require.resolve(path.join(__dirname, "./workflows")),
    taskQueue: "place-hold-task-queue",
    activities,
  });

  const worker3 = await Worker.create({
    workflowsPath: require.resolve(path.join(__dirname, "./workflows")),
    taskQueue: "webhook-task-queue",
    activities,
  });

  await Promise.all([worker.run(), worker2.run(), worker3.run()]);
}

run().catch((err) => {
  console.error("Failed to run workers", err);
  process.exit(1);
});
