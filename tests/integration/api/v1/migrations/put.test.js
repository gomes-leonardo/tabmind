import database from "infra/database";

test("PUT method to api/v1/migrations should return to 405", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "PUT",
  });
  expect(response.status).toBe(405);

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  expect(databaseOpenedConnectionsValue).toBe(1);
});
