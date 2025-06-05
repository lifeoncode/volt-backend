import request from "supertest";
import { app } from "../index";

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/volt/api/auth/register").send({
      username: "tester",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("test@example.com");
  });
});

describe("Auth API", () => {
  it("should fail to login user", async () => {
    const res = await request(app).post("/volt/api/auth/login").send({
      email: "test@example.com",
      password: "password1111",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("invalid credentials");
  });
});

describe("Auth API", () => {
  it("should login user", async () => {
    const res = await request(app).post("/volt/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toBe("test@example.com");
  });
});
