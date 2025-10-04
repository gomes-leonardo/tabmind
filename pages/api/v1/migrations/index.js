import { createRouter } from "next-connect";
import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";
import migrator from "models/migrator.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("/n Erro do catch no next-connect: do /api/v1/status");
  console.log(publicErrorObject);
  return response.status(publicErrorObject.statusCode).json(publicErrorObject);
}
async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const pendingMigrations = await migrator.runPendingMigrations();
  if (pendingMigrations.length > 0) {
    return response.status(201).json(pendingMigrations);
  }
  return response.status(200).json(pendingMigrations);
}
