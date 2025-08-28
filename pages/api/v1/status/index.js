import database from "infra/database.js"

async function status(request, response) {
  const result = await database.query('SELECT 1 + 1 as sum;');
  console.log(result.rows)
  response.status(200).json({ chave: "São Paulo rebaixado em 1990" });
}

export default status;
