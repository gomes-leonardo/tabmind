import bcryptjs from "bcryptjs";
import { InternalServerError } from "infra/errors";

const PEPPER = process.env.AUTH_PEPPER;

async function hash(password) {
  const rounds = getNumberOfRounds();
  if (!PEPPER) {
    throw new InternalServerError({
      message: "Erro interno ao processar autenticação.",
      cause: new Error("Pepper não configurada ou não encontrada."),
    });
  }
  const passwordWithPepper = password + PEPPER;

  return await bcryptjs.hash(passwordWithPepper, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPassword) {
  if (!PEPPER) {
    throw new InternalServerError({
      message: "Erro interno ao processar autenticação.",
      cause: new Error("Pepper não configurada ou não encontrada."),
    });
  }
  return await bcryptjs.compare(providedPassword + PEPPER, storedPassword);
}

const password = {
  hash,
  compare,
  PEPPER,
};

export default password;
