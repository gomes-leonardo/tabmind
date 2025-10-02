import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller";

const router = createRouter();

const migrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" is not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...migrationOptions,
      dbClient,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    dbClient.end();
  }
}

async function postHandler(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" is not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...migrationOptions,
      dbClient,
      dryRun: false,
    });

    if (pendingMigrations.length > 0) {
      return response.status(201).json(pendingMigrations);
    }
    return response.status(200).json(pendingMigrations);
  } finally {
    dbClient.end();
  }
}
