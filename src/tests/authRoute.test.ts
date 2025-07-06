import request from "supertest";
import { app } from "../index";

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/volt/api/auth/register").send({
      username: "Rick_Sanchez",
      email: "sanchez@email.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("sanchez@email.com");
  });
});

describe("Auth API", () => {
  it("should fail to login user", async () => {
    const res = await request(app).post("/volt/api/auth/login").send({
      email: "sanchez@email.com",
      password: "password1111",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Invalid credentials");
  });
});

describe("Auth API", () => {
  it("should login user", async () => {
    const res = await request(app).post("/volt/api/auth/login").send({
      email: "sanchez@email.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toBe("sanchez@email.com");
  });
});
