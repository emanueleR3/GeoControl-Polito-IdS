import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

/**
 * User E2E Tests
 * 
 * Test Naming Convention: Tx.y
 * - x: Endpoint being tested (1=getAllUsers, 2=getUserByUsername, 3=createUser, 4=deleteUser)
 * - y: Test number for that endpoint
 * 
 * Test Structure:
 * T1.1: get all users - tests successful retrieval of all users
 * T1.2: get all users: 401 - tests unauthorized access
 * T1.3: get all users: 403 - tests insufficient permissions
 * T2.1: getUserByUsername - tests successful retrieval by username
 * T2.2: getUserByUsername: 404 - tests user not found
 * T2.3: getUserByUsername: 403 - tests insufficient permissions
 * T2.4: getUserByUsername: 401 - tests unauthorized access
 * T3.1: createUser - tests successful user creation
 * T3.2: createUser: 409 - tests username conflict
 * T3.3: createUser: 403 - tests insufficient permissions
 * T3.4: createUser: 401 - tests unauthorized access
 * T3.5: createUser: 400 - tests invalid input data
 * T4.1: deleteUser - tests successful user deletion
 * T4.2: deleteUser: 403 - tests insufficient permissions
 * T4.3: deleteUser: 401 - tests unauthorized access
 * T4.4: deleteUser: 404 - tests user not found
 */

describe("users (e2e)", () => {
  let adminToken: string;
  let viewerToken: string;
  let operatorToken: string;

  beforeAll(async () => {
    await beforeAllE2e();
    adminToken = generateToken(TEST_USERS.admin);
    viewerToken = generateToken(TEST_USERS.viewer);
    operatorToken = generateToken(TEST_USERS.operator);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("T1.1: get all users", async () => {
    const res = await request(app).get("/api/v1/users")
    .set("Authorization", `Bearer ${adminToken}`);
   
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const usernames = res.body.map((u: any) => u.username).sort();
    const types = res.body.map((u: any) => u.type).sort();

    expect(usernames).toEqual(["admin", "operator", "viewer"]);
    expect(types).toEqual(["admin", "operator", "viewer"]);
    });
  it("T1.2: get all users: 401 error", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(401);
  });

  it("T1.3: get all users: 403 error", async () => {
    const res = await request(app).get("/api/v1/users")
    .set("Authorization", `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });

  it("T2.1: getUserByUsername", async () => {

    const res1 = await request(app).get("/api/v1/users/viewer").set("Authorization", `Bearer ${adminToken}`);
    const res2 = await request(app).get("/api/v1/users/operator").set("Authorization", `Bearer ${adminToken}`);
    const res3 = await request(app).get("/api/v1/users/admin").set("Authorization", `Bearer ${adminToken}`);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
    expect(res1.body.username).toBe("viewer");
    expect(res2.body.username).toBe("operator");
    expect(res3.body.username).toBe("admin");
    expect(res1.body.type).toBe("viewer");
    expect(res2.body.type).toBe("operator");
    expect(res3.body.type).toBe("admin");
    expect(res1.body.password).toBeUndefined();
  });
  it("T2.2: getUserByUsername: 404", async () => {
    const res = await request(app).get("/api/v1/users/unknown").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
  it("T2.3: getUserByUsername: 403", async () => {
    const res = await request(app).get("/api/v1/users/viewer").set("Authorization", `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  }); 
  it("T2.4: getUserByUsername: 401", async () => {
    const res = await request(app).get("/api/v1/users/viewer");
    expect(res.status).toBe(401);
  });


  it("T3.1: createUser", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        username: "testuser",
        password: "testpass",
        type: "viewer"
      });

    const res1 = await request(app).get("/api/v1/users/testuser").set("Authorization", `Bearer ${adminToken}`);
    expect(res1.status).toBe(200);
    expect(res1.body.username).toBe("testuser");

    expect(res.status).toBe(201);
  });
  it("T3.2: createUser: 409", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        username: "admin",
        password: "adminpass",
        type: "admin"
      });
    expect(res.status).toBe(409);
  });

  it("T3.3: createUser: 403", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        username: "testuser",
        password: "testpass",
        type: "viewer"
      });
    expect(res.status).toBe(403);
  });

  it("T3.4: createUser: 401", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .send({
        username: "testuser",
        password: "testpass",
        type: "viewer"
      });
    expect(res.status).toBe(401);
  });

  it("T3.5: createUser: 400", async () => {
    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        username: "testuser",
        password: "testpass",
      });
    expect(res.status).toBe(400);
  });

  it("T4.1: deleteUser", async () => {
    const res = await request(app)
      .delete("/api/v1/users/testuser")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const res1 = await request(app).get("/api/v1/users/testuser").set("Authorization", `Bearer ${adminToken}`);
    expect(res1.status).toBe(404);

  });

  it("T4.2: deleteUser: 403", async () => {
    const res = await request(app)
      .delete("/api/v1/users/admin")
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });

  it("T4.3: deleteUser: 401", async () => {
    const res = await request(app)
      .delete("/api/v1/users/admin");
    expect(res.status).toBe(401);
  });

  it("T4.4: deleteUser: 404", async () => {
    const res = await request(app)
      .delete("/api/v1/users/unknown")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

});
