import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { SensorRepository } from "@repositories/SensorRepository";

/**
 * Sensor E2E Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Endpoint being tested (1=getAllSensors, 2=createSensor, 3=getSensorByMacAddress, 4=updateSensor, 5=deleteSensor)
 * - y: Test number for that endpoint
 *
 * Test Structure:
 * T1.1: get all sensors of a gateway - tests successful retrieval of sensors
 * T1.2: get all sensors of a gateway: 401 - tests unauthorized access
 * T1.3: get all sensors of a gateway: 404 - tests gateway not found
 * T2.1: create a new sensor - tests successful sensor creation
 * T2.2: create a new sensor: 401 - tests unauthorized access
 * T2.3: create a new sensor: 403 - tests insufficient permissions
 * T2.4: create a new sensor: 404 - tests gateway not found
 * T2.5: create a new sensor: 409 - tests MAC address conflict
 * T3.1: get sensor by macAddress - tests successful retrieval by MAC
 * T3.2: get sensor by macAddress: 401 - tests unauthorized access
 * T3.3: get sensor by macAddress: 404 - tests sensor not found
 * T4.1: update sensor - tests successful sensor update
 * T4.2: update sensor: 401 - tests unauthorized access
 * T4.3: update sensor: 403 - tests insufficient permissions
 * T4.4: update sensor: 404 - tests sensor not found
 * T4.5: update sensor: 409 - tests MAC address conflict
 * T5.1: delete sensor - tests successful sensor deletion
 * T5.2: delete sensor: 401 - tests unauthorized access
 * T5.3: delete sensor: 403 - tests insufficient permissions
 * T5.4: delete sensor: 404 - tests sensor not found
 */

describe("sensors (e2e)", () => {
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

  it("T1.1: get all sensors of a gateway", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors")
      .set("Authorization", `Bearer ${adminToken}`);

    console.log("body: ", res.body);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const names = res.body.map((u: any) => u.name).sort();

    expect(names).toEqual(["sensor1", "sensor2"]);
  });

  it("T1.2: get all sensors of a gateway: 401", async () => {
    const res = await request(app).get(
      "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors"
    );

    expect(res.status).toBe(401);
  });

  it("T1.3: get all sensors of a gateway: 404", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:99/sensors")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  // create a new sensor for a gateway
  it("T2.1: create a new sensor", async () => {
    const newSensor = {
      macAddress: "00:00:00:00:00:04",
      name: "sensor4",
      description: "description4",
      variable: "Temperature",
      unit: "Celsius",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(newSensor);

    expect(res.status).toBe(201);

    // Verify the sensor was created
    const res_ = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors")
      .set("Authorization", `Bearer ${adminToken}`);

    console.log("body: ", res.body);
    expect(res_.status).toBe(200);
    expect(res_.body.length).toBe(3);
  });
  it("T2.2: create a new sensor: 401", async () => {
    const newSensor = {
      macAddress: "00:00:00:00:00:05",
      name: "sensor5",
      description: "description5",
      variable: "Humidity",
      unit: "Percentage",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors")
      .send(newSensor);

    expect(res.status).toBe(401);
  });

  it("T2.3: create a new sensor: 403", async () => {
    const newSensor = {
      macAddress: "00:00:00:00:00:06",
      name: "sensor6",
      description: "description6",
      variable: "Pressure",
      unit: "Pascal",
    };
    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(newSensor);
    expect(res.status).toBe(403);
  });

  it("T2.4: create a new sensor: 404", async () => {
    const newSensor = {
      macAddress: "00:00:00:00:00:07",
      name: "sensor7",
      description: "description7",
      variable: "Light",
      unit: "Lux",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways/00:00:00:00:00:99/sensors")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(newSensor);

    expect(res.status).toBe(404);
  });

  it("T2.5: create a new sensor: 409", async () => {
    const existingSensor = {
      macAddress: "00:00:00:00:00:01",
      name: "sensor1",
      description: "description1",
      variable: "Temperature",
      unit: "Celsius",
    };

    const res = await request(app)
      .post("/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors")
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(existingSensor);

    expect(res.status).toBe(409);
  });

  // get sensor by macAddress
  it("T3.1: get sensor by macAddress", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.macAddress).toBe("00:00:00:00:00:01");
    expect(res.body.name).toBe("sensor1");
  });

  it("T3.2: get sensor by macAddress: 401", async () => {
    const res = await request(app).get(
      "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
    );

    expect(res.status).toBe(401);
  });

  it("T3.3: get sensor by macAddress: 404", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:99"
      )
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  // update sensor
  it("T4.1: update sensor", async () => {
    const updatedSensor = {
      macAddress: "00:00:00:00:00:01",
      name: "Updated Sensor 1",
      description: "Updated description for sensor 1",
      variable: "Temperature",
      unit: "Celsius",
    };

    const res = await request(app)
      .patch(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(updatedSensor);

    expect(res.status).toBe(204);

    // Verify the sensor was updated
    const res_ = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res_.status).toBe(200);
    expect(res_.body.name).toBe("Updated Sensor 1");
  });

  it("T4.2: update sensor: 401", async () => {
    const updatedSensor = {
      name: "Updated Sensor 1",
      description: "Updated description for sensor 1",
      variable: "Temperature",
      unit: "Celsius",
    };

    const res = await request(app)
      .patch(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .send(updatedSensor);

    expect(res.status).toBe(401);
  });

  it("T4.3: update sensor: 403", async () => {
    const updatedSensor = {
      name: "Updated Sensor 1",
      description: "Updated description for sensor 1",
      variable: "Temperature",
      unit: "Celsius",
    };

    const res = await request(app)
      .patch(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(updatedSensor);

    expect(res.status).toBe(403);
  });

  it("T4.4: update sensor: 404", async () => {
    const updatedSensor = {
      name: "Updated Sensor 1",
      description: "Updated description for sensor 1",
      variable: "Temperature",
      unit: "Celsius",
    };

    const res = await request(app)
      .patch(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:99"
      )
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(updatedSensor);

    expect(res.status).toBe(404);
  });

  it("T4.5: update sensor: 409", async () => {
    const updatedSensor = {
      macAddress: "00:00:00:00:00:02",
      name: "sensor1",
      description: "description1",
      variable: "Temperature",
      unit: "Celsius",
    };

    const res = await request(app)
      .patch(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .set("Authorization", `Bearer ${operatorToken}`)
      .send(updatedSensor);

    expect(res.status).toBe(409);
  });

  // delete
  it("T5.1: delete sensor", async () => {
    const res = await request(app)
      .delete(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .set("Authorization", `Bearer ${operatorToken}`);

    expect(res.status).toBe(204);

    // Verify the sensor was deleted
    const res_ = await request(app)
      .get("/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res_.status).toBe(200);
    expect(res_.body.length).toBe(2);
  });

  it("T5.2: delete sensor: 401", async () => {
    const res = await request(app).delete(
      "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
    );

    expect(res.status).toBe(401);
  });
  it("T5.3: delete sensor: 403", async () => {
    const res = await request(app)
      .delete(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01"
      )
      .set("Authorization", `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });
  it("T5.4: delete sensor: 404", async () => {
    const res = await request(app)
      .delete(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:99"
      )
      .set("Authorization", `Bearer ${operatorToken}`);

    expect(res.status).toBe(404);
  });
});
