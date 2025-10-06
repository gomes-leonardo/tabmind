import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { ServiceError } from "infra/errors";

const defaultMigrationsOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function runMigrations({ dryRun, context }) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
      dryRun,
    });

    return pendingMigrations;
  } catch (error) {
    const action =
      context === "list" ? "listar migrations" : "rodar migrations";
    const serviceErrorObject = new ServiceError({
      message: `Erro ao ${action}`,
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    dbClient?.end();
  }
}

var migrator = {
  listPendingMigrations: async () =>
    runMigrations({ dryRun: true, context: "list" }),
  runPendingMigrations: async () =>
    runMigrations({ dryRun: false, context: "run" }),
};

export default migrator;
