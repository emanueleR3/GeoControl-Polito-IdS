import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { GatewayRepository } from "@repositories/GatewayRepository";

/**
 * Gateway E2E Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Endpoint being tested (1=getAllGateways, 2=createGateway, 3=getGatewayByMacAddress, 4=updateGateway, 5=deleteGateway)
 * - y: Test number for that endpoint
 *
 * Test Structure:
 * T1.1: get all gateways of a network - tests successful retrieval of gateways
 * T1.2: get all gateways of a network: 401 - tests unauthorized access
 * T1.3: get all gateways of a network: 404 - tests network not found
 * T2.1: create a new gateway - tests successful gateway creation
 * T2.2: create a new gateway: 401 - tests unauthorized access
 * T2.3: create a new gateway: 403 - tests insufficient permissions
 * T2.4: create a new gateway: 404 - tests network not found
 * T2.5: create a new gateway: 409 - tests MAC address conflict
 * T3.1: get gateway by macAddress - tests successful retrieval by MAC
 * T3.2: get gateway by macAddress: 401 - tests unauthorized access
 * T3.3: get gateway by macAddress: 404 - tests gateway not found
 * T4.1: update gateway - tests successful gateway update
 * T4.2: update gateway: 401 - tests unauthorized access
 * T4.3: update gateway: 403 - tests insufficient permissions
 * T4.4: update gateway: 404 - tests gateway not found
 * T4.5: update gateway: 409 - tests MAC address conflict
 * T5.1: delete gateway - tests successful gateway deletion
 * T5.2: delete gateway: 401 - tests unauthorized access
 * T5.3: delete gateway: 403 - tests insufficient permissions
 * T5.4: delete gateway: 404 - tests gateway not found
 */

describe("gateways (e2e)", () => {
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

  it("T1.1: get all gateways of a network", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/gateways")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);

    const names = res.body.map((u: any) => u.name).sort();

    expect(names).toEqual(["gateway1"]);
  });

  it("T1.2: get all gateways of a network: 401", async () => {
    const res = await request(app).get("/api/v1/networks/NET01/gateways");

    expect(res.status).toBe(401);
  });

  it("T1.3: get all gateways of a network: 404", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET99/gateways")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  // create
  it("T2.1: create a new gateway", async () => {
    const newGateway = {
      macAddress: "00:00:00:00:00:04",
      name: "gateway4",
      description: "description4",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(newGateway);

    expect(res.status).toBe(201);

    // verifico
    const getRes = await request(app)
      .get("/api/v1/networks/NET01/gateways")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(
      getRes.body.some((g: any) => g.macAddress === newGateway.macAddress)
    ).toBeTruthy();
  });

  it("T2.2: create a new gateway: 401", async () => {
    const newGateway = {
      macAddress: "00:00:00:00:00:05",
      name: "gateway5",
      description: "description5",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways")
      .send(newGateway);

    expect(res.status).toBe(401);
  });

  it("T2.3: create a new gateway: 403", async () => {
    const newGateway = {
      macAddress: "00:00:00:00:00:06",
      name: "gateway6",
      description: "description6",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(newGateway);

    expect(res.status).toBe(403);
  });

  it("T2.4: create a new gateway: 404", async () => {
    const newGateway = {
      macAddress: "00:00:00:00:00:07",
      name: "gateway7",
      description: "description7",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET99/gateways")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(newGateway);

    expect(res.status).toBe(404);
  });

  it("T2.5: create a new gateway: 409", async () => {
    const existingGateway = {
      macAddress: "00:00:00:00:00:01",
      name: "gateway1",
      description: "description1",
    };
    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(existingGateway);
    expect(res.status).toBe(409);
  });

  // get by macAddress
  it("T3.1: get gateway by macAddress", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.macAddress).toBe("00:00:00:00:00:01");
  });

  it("T3.2: get gateway by macAddress: 401", async () => {
    const res = await request(app).get(
      "/api/v1/networks/NET01/gateways/00:00:00:00:00:01"
    );

    expect(res.status).toBe(401);
  });

  it("T3.3: get gateway by macAddress: 404", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:99")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  // update
  it("T4.1: update gateway", async () => {
    const updatedGateway = {
      macAddress: "00:00:00:00:00:01",
      name: "gateway1-updated",
      description: "description1-updated",
    };

    const res = await request(app)
      .patch("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(updatedGateway);

    expect(res.status).toBe(204);

    // verifico
    const getRes = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe(updatedGateway.name);
  });

  it("T4.2: update gateway: 401", async () => {
    const updatedGateway = {
      macAddress: "00:00:00:00:00:01",
      name: "gateway1-updated",
      description: "description1-updated",
    };

    const res = await request(app)
      .patch("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .send(updatedGateway);

    expect(res.status).toBe(401);
  });

  it("T4.3: update gateway: 403", async () => {
    const updatedGateway = {
      macAddress: "00:00:00:00:00:01",
      name: "gateway1-updated",
      description: "description1-updated",
    };

    const res = await request(app)
      .patch("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(updatedGateway);

    expect(res.status).toBe(403);
  });

  it("T4.4: update gateway: 404", async () => {
    const updatedGateway = {
      macAddress: "00:00:00:00:00:01",
      name: "gateway1-updated",
      description: "description1-updated",
    };

    const res = await request(app)
      .patch("/api/v1/networks/NET01/gateways/00:00:00:00:00:99")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(updatedGateway);

    expect(res.status).toBe(404);
  });

  it("T4.5: update gateway: 409", async () => {
    const updatedGateway = {
      macAddress: "00:00:00:00:00:02",
      name: "gateway2-updated",
      description: "description2-updated",
    };

    const res = await request(app)
      .patch("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(updatedGateway);

    expect(res.status).toBe(409);
  });

  // delete

  it("T5.1: delete gateway", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .set("Authorization", `Bearer ${operatorToken}`);

    expect(res.status).toBe(204);

    // verifico
    const getRes = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:01")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getRes.status).toBe(404);
  });

  it("T5.2: delete gateway: 401", async () => {
    const res = await request(app).delete(
      "/api/v1/networks/NET01/gateways/00:00:00:00:00:02"
    );

    expect(res.status).toBe(401);
  });

  it("T5.3: delete gateway: 403", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET01/gateways/00:00:00:00:00:02")
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });

  it("T5.4: delete gateway: 404", async () => {
    const res = await request(app)
      .delete("/api/v1/networks/NET01/gateways/00:00:00:00:00:99")
      .set("Authorization", `Bearer ${operatorToken}`);

    expect(res.status).toBe(404);
  });
});
