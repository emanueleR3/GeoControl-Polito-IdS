import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { TEST_NETWORKS } from "@test/e2e/lifecycle";
import { after } from "node:test";

/**
 * Network E2E Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Endpoint being tested (1=getAllNetworks, 2=createNetwork, 3=getNetworkByCode, 4=updateNetwork, 5=deleteNetwork)
 * - y: Test number for that endpoint
 *
 * Test Structure:
 * T1.1: get all networks - tests successful retrieval of all networks
 * T1.2: get all networks: 401 - tests unauthorized access
 * T2.1: create network - tests successful network creation
 * T2.2: create network: 401 - tests unauthorized access
 * T2.3: create network: 403 - tests insufficient permissions
 * T2.4: create network: 409 - tests code conflict
 * T3.1: get network by code - tests successful retrieval by code
 * T3.2: get network by code: 401 - tests unauthorized access
 * T3.3: get network by code: 404 - tests network not found
 * T4.1: update network - tests successful network update
 * T4.2: update network: 400 - tests invalid input data
 * T4.3: update network: 401 - tests unauthorized access
 * T4.4: update network: 403 - tests insufficient permissions
 * T4.5: update network: 404 - tests network not found
 * T4.6: update network: 409 - tests code conflict
 * T5.1: delete network - tests successful network deletion
 * T5.2: delete network: 401 - tests unauthorized access
 * T5.3: delete network: 403 - tests insufficient permissions
 * T5.4: delete network: 404 - tests network not found
 */

describe("networks (e2e)", () => {
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

  // retrieve all networks

  it("T1.1: get all networks", async () => {
    const res = await request(app)
      .get("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const names = res.body.map((u: any) => u.name).sort();

    expect(names).toEqual(["network1", "network2", "network3"]);
  });

  it("T1.2: get all networks: 401 Unauthorized (e2e)", async () => {
    const res = await request(app).get("/api/v1/networks");
    expect(res.status).toBe(401);
  });

  // create a new network

  it("T2.1: create network", async () => {
    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: "NET04",
        name: "network4",
        description: "description4",
      });
    expect(res.status).toBe(201);

    const res1 = await request(app)
      .get("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res1.status).toBe(200);
    expect(res1.body.length).toBe(4);

    const names = res1.body.map((u: any) => u.name).sort();

    expect(names).toEqual(["network1", "network2", "network3", "network4"]);
  });

  it("T2.2: create network: 401 Unauthorized (e2e)", async () => {
    const res = await request(app).post("/api/v1/networks").send({
      code: "NET04",
      name: "network4",
      description: "description4",
    });
    expect(res.status).toBe(401);
  });

  it("T2.3: create network: 403 InsufficientRights (e2e)", async () => {
    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        code: "NET04",
        name: "network4",
        description: "description4",
      });
    expect(res.status).toBe(403);
  });

  it("T2.4: create network: 409 Conflict (e2e)", async () => {
    const res = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: "NET01",
        name: "network1",
        description: "description1",
      });
    expect(res.status).toBe(409);
  });

  // retrieve a specific network

  it("T3.1: get network by code", async () => {
    const res1 = await request(app)
      .get("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${adminToken}`);
    const res2 = await request(app)
      .get("/api/v1/networks/NET02")
      .set("Authorization", `Bearer ${adminToken}`);
    const res3 = await request(app)
      .get("/api/v1/networks/NET03")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
    expect(res1.body.code).toBe("NET01");
    expect(res2.body.code).toBe("NET02");
    expect(res3.body.code).toBe("NET03");
    expect(res1.body.name).toBe("network1");
    expect(res2.body.name).toBe("network2");
    expect(res3.body.name).toBe("network3");
  });

  it("T3.2: get network by code: 401 Unauthorized (e2e)", async () => {
    const res = await request(app).get("/api/v1/networks/NET01");
    expect(res.status).toBe(401);
  });

  it("T3.3: get network by code: 404 InsufficientRights (e2e)", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NETunknown")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  // update a network

  it("T4.1: update network", async () => {
    const res = await request(app)
      .patch("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: "NET01",
        name: "network1_updated",
        description: "description1_updated",
      });
    expect(res.status).toBe(204);

    const res1 = await request(app)
      .get("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res1.status).toBe(200);
    expect(res1.body.name).toBe("network1_updated");
  });

  it("T4.2: update network: 400 InvalidInput (e2e)", async () => {
    const res = await request(app)
      .patch("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: "1",
        name: 123,
        description: "description1_updated",
      });
    expect(res.status).toBe(400);
  });

  it("T4.3: update network: 401 Unauthorized (e2e)", async () => {
    const res = await request(app).patch("/api/v1/networks/NET01").send({
      code: "NET01",
      name: "network1_updated",
      description: "description1_updated",
    });
    expect(res.status).toBe(401);
  });

  it("T4.4: update network: 403 InsufficientRights (e2e)", async () => {
    const res = await request(app)
      .patch("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        code: "NET01",
        name: "network1_updated",
        description: "description1_updated",
      });
    expect(res.status).toBe(403);
  });

  it("T4.5: update network: 404 NotFound (e2e)", async () => {
    const res = await request(app)
      .patch("/api/v1/networks/NETunknown")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: "NETunknown",
        name: "networkunknown_updated",
        description: "descriptionunknown_updated",
      });
    expect(res.status).toBe(404);
  });

  it("T4.6: update network: 409 Conflict (e2e)", async () => {
    const res = await request(app)
      .patch("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        code: "NET02",
        name: "network2",
        description: "description1_updated",
      });
    expect(res.status).toBe(409);
  });

  // delete a network
  it("T5.1: delete network", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it("T5.2: delete network: 401 Unauthorized (e2e)", async () => {
    const res = await request(app).delete("/api/v1/networks/NET01");
    expect(res.status).toBe(401);
  });

  it("T5.3: delete network: 403 InsufficientRights (e2e)", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET01")
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });

  it("T5.4: delete network: 404 NotFound (e2e)", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NETunknown")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  /*
    it("getNetworkByName", async () => {
    
        const res1 = await request(app).get("/api/v1/networks/network1").set("Authorization", `Bearer ${adminToken}`);
        const res2 = await request(app).get("/api/v1/networks/network2").set("Authorization", `Bearer ${adminToken}`);
        const res3 = await request(app).get("/api/v1/networks/network3").set("Authorization", `Bearer ${adminToken}`);
    
        expect(res1.status).toBe(200);
        expect(res2.status).toBe(200);
        expect(res3.status).toBe(200);
        expect(res1.body.name).toBe("network1");
        expect(res2.body.name).toBe("network2");
        expect(res3.body.name).toBe("network3");
        expect(res1.body.type).toBe("type1");
        expect(res2.body.type).toBe("type2");
        expect(res3.body.type).toBe("type3");
        const res_err1 = await request(app).get("/api/v1/networks/unknown").set("Authorization", `Bearer ${adminToken}`);
        const res_err2 = await request(app).get("/api/v1/networks/network1").set("Authorization", `Bearer ${viewerToken}`);
        expect(res_err1.status).toBe(404);
        expect(res_err2.status).toBe(403);  
    });
    */
});
