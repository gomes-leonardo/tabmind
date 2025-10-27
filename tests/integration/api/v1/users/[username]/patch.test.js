import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
        },
      );
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O Username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        statusCode: 404,
      });
    });

    test("With same 'username' but different case", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "differentcase",
          email: "user@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/differentcase",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "DifferentCase",
          }),
        },
      );

      expect(response2.status).toBe(200);
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "gabriella",
          email: "gabriella@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "leonardo",
          email: "leonardo@email.com",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(201);

      const response3 = await fetch(
        "http://localhost:3000/api/v1/users/gabriella",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "leonardo",
          }),
        },
      );

      expect(response3.status).toBe(400);
      const response2Body = await response3.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        statusCode: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "user2@email.com",
          }),
        },
      );

      expect(response2.status).toBe(400);
      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O e-mail informado já está sendo utilizado.",
        action: "Utilize outro e-mail para realizar esta operação.",
        statusCode: 400,
      });
    });

    test("With unique 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/user1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser",
          }),
        },
      );

      expect(response2.status).toBe(200);
      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "uniqueUser",
        email: "user1@email.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(response2Body.updated_at > response2Body.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "UniqueEmail",
          email: "uniqueemail1@email.com",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/uniqueemail",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueemail@email.com",
          }),
        },
      );

      expect(response2.status).toBe(200);
      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "UniqueEmail",
        email: "uniqueemail@email.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(response2Body.updated_at > response2Body.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword1",
          email: "newPassword1@email.com",
          password: "newPassword1",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/newPassword1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response2.status).toBe(200);
      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "newPassword1",
        email: "newPassword1@email.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(response2Body.updated_at > response2Body.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newPassword1");
      const pepper = process.env.AUTH_PEPPER;

      const correctPasswordMatch = await password.compare(
        "newPassword2" + pepper,
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newPassword1" + pepper,
        userInDatabase.password,
      );

      const passwordWithoutPepper = await password.compare(
        "newPassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
      expect(passwordWithoutPepper).toBe(false);
    });
  });
});
