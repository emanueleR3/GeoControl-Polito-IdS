import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

/**
 * Measurement E2E Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Endpoint being tested (1=getMeasurements, 2=getStats, 3=getOutliers, 4=getSensorMeasurements, 5=storeMeasurements, 6=getSensorStats, 7=getSensorOutliers)
 * - y: Test number for that endpoint
 *
 * Test Structure:
 * T1.1: get all measurements for a set of sensors of a network - tests successful retrieval
 * T1.2: get all measurements for a set of sensors of a network: 401 - tests unauthorized access
 * T1.3: get all measurements for a set of sensors of a network: 404 - tests network not found
 * T1.4: get all measurements for a set of sensors of a network: 400 - tests invalid parameters
 * T2.1: get statistics for a set of sensors of a network - tests successful stats retrieval
 * T2.2: get statistics for a set of sensors of a network: 401 - tests unauthorized access
 * T2.3: get statistics for a set of sensors of a network: 404 - tests network not found
 * T2.4: get statistics for a set of sensors of a network: 400 - tests invalid parameters
 * T3.1: get outliers for a set of sensors of a network - tests successful outliers retrieval
 * T3.2: get outliers for a set of sensors of a network: 401 - tests unauthorized access
 * T3.3: get outliers for a set of sensors of a network: 404 - tests network not found
 * T3.4: get outliers for a set of sensors of a network: 400 - tests invalid parameters
 * T4.1: get measurements for a sensor - tests successful sensor measurements retrieval
 * T4.2: get measurements for a sensor: 400 - tests invalid parameters
 * T4.3: get measurements for a sensor: 401 - tests unauthorized access
 * T4.4: get measurements for a sensor: 404 - tests sensor not found
 * T5.1: store measurements for a sensor - tests successful measurement storage
 * T5.2: store measurements for a sensor: 401 - tests unauthorized access
 * T5.3: store measurements for a sensor: 404 - tests sensor not found
 * T5.4: store measurements for a sensor: 400 - tests invalid data format
 * T5.5: store measurements for a sensor: 403 - tests insufficient permissions
 * T6.1: get statistics for a specific sensor - tests successful sensor stats retrieval
 * T6.2: get statistics for a specific sensor: 400 - tests invalid parameters
 * T6.3: get statistics for a specific sensor: 401 - tests unauthorized access
 * T6.4: get statistics for a specific sensor: 404 - tests sensor not found
 * T7.1: get outliers for a specific sensor - tests successful sensor outliers retrieval
 * T7.2: get outliers for a specific sensor: 400 - tests invalid parameters
 * T7.3: get outliers for a specific sensor: 401 - tests unauthorized access
 * T7.4: get outliers for a specific sensor: 404 - tests sensor not found
 */

describe("measurements (e2e)", () => {
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

  it("T1.1: get all measurements for a set of sensors of a network", async () => {
    // nel body della richiesta, passiamo i mac address dei sensori, la start date e l'end date
    const res = await request(app)
      .get("/api/v1/networks/NET01/measurements")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        sensorMacs: ["00:00:00:00:00:01"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("T1.2: get all measurements for a set of sensors of a network: 401", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/measurements")
      .query({
        sensorMacs: ["00:00:00:00:00:01"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(401);
  });

  it("T1.3: get all measurements for a set of sensors of a network: 404", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET99/measurements")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        sensorMacs: ["00:00:00:00:00:01"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(404);
  });

  it("T1.4: get all measurements for a set of sensors of a network: 400", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/measurements")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        gatewayMacs: ["00:00:00:00:00:01"],
        startDate: "2023-10-01T12:30:00Z",
        endDate: "2023-10-01T12:00:00Z",
      });
    expect(res.status).toBe(400);
  });

  // retrieve statistics for a set of sensors of a network
  it("T2.1: get statistics for a set of sensors of a network", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/stats")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        sensorMacs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    // console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("T2.2: get statistics for a set of sensors of a network: 401", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/stats")
      .query({
        sensorMacs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(401);
  });

  it("T2.3: get statistics for a set of sensors of a network: 404", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET99/stats")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        sensorMacs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(404);
  });

  it("T2.4: get statistics for a set of sensors of a network: 400", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/stats")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        Macs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:30:00Z",
        endDate: "2023-10-01T12:00:00Z",
      });
    expect(res.status).toBe(400);
  });

  // retrieve only outliers measurements for a set of sensors of a network
  it("T3.1: get outliers for a set of sensors of a network", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/outliers")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        sensorMacs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    console.log(res.body);
    expect(res.status).toBe(200);
    // expect(res.body.length).toBe(2);
  });

  it("T3.2: get outliers for a set of sensors of a network: 401", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/outliers")
      .query({
        sensorMacs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(401);
  });

  it("T3.3: get outliers for a set of sensors of a network: 404", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET99/outliers")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        sensorMacs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(404);
  });

  it("T3.4: get outliers for a set of sensors of a network: 400", async () => {
    const res = await request(app)
      .get("/api/v1/networks/NET01/outliers")
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        Macs: ["00:00:00:00:00:01", "00:00:00:00:00:02"],
        startDate: "2023-10-01T12:30:00Z",
        endDate: "2023-10-01T12:00:00Z",
      });
    expect(res.status).toBe(400);
  });

  // retrieve measurements for a sensor
  it("T4.1: get measurements for a sensor", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.body.measurements.length).toBe(3);
  });

  it("T4.2: get measurements for a sensor: 400", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        start: "2023-10-01T12:30:00Z",
        endDate: "2023-10-01T12:00:00Z",
      });
    expect(res.status).toBe(400);
  });

  it("T4.3: get measurements for a sensor: 401", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(401);
  });

  it("T4.4: get measurements for a sensor: 404", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET99/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(404);
  });

  // store measurements
  it("T5.1: store measurements for a sensor", async () => {
    const measurements = [
      {
        createdAt: "2025-02-18T16:00:00Z",
        value: 26.0,
      },
      {
        createdAt: "2025-02-18T16:01:00Z",
        value: 60.0,
      },
    ];
    const res = await request(app)
      .post(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(measurements);
    expect(res.status).toBe(201);

    const res_get = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2025-02-18T16:00:00Z",
        endDate: "2025-02-18T16:05:00Z",
      });
    expect(res_get.status).toBe(200);
    // console.log(res_get.body);
    expect(res_get.body.measurements.length).toBe(2);
    expect(res_get.body.measurements[0].value).toBe(26);
    expect(res_get.body.measurements[1].value).toBe(60.0);
  });

  it("T5.2: store measurements for a sensor: 401", async () => {
    const measurements = [
      {
        createdAt: "2025-02-18T16:00:00Z",
        value: 26.0,
      },
      {
        createdAt: "2025-02-18T16:01:00Z",
        value: 60.0,
      },
    ];
    const res = await request(app)
      .post(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .send(measurements);
    expect(res.status).toBe(401);
  });

  it("T5.3: store measurements for a sensor: 404", async () => {
    const measurements = [
      {
        createdAt: "2025-02-18T16:00:00Z",
        value: 26.0,
      },
      {
        createdAt: "2025-02-18T16:01:00Z",
        value: 60.0,
      },
    ];
    const res = await request(app)
      .post(
        "/api/v1/networks/NET99/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(measurements);
    expect(res.status).toBe(404);
  });

  it("T5.4: store measurements for a sensor: 400", async () => {
    const measurements = [
      {
        created: "2025-02-18T16:00:00Z",
        value: 26.0,
      },
      {
        created: "2025-02-18T16:01:00Z",
        value: 60.0,
      },
    ];
    const res = await request(app)
      .post(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .send(measurements);
    expect(res.status).toBe(400);
  });

  it("T5.5: store measurements for a sensor: 403", async () => {
    const measurements = [
      {
        createdAt: "2025-02-18T16:00:00Z",
        value: 26.0,
      },
      {
        createdAt: "2025-02-18T16:01:00Z",
        value: 60.0,
      },
    ];
    const res = await request(app)
      .post(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/measurements"
      )
      .set("Authorization", `Bearer ${viewerToken}`)
      .send(measurements);
    expect(res.status).toBe(403);
  });

  // retrieve statistics for a specific sensor
  it("T6.1: get statistics for a specific sensor", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/stats"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(200);
  });

  it("T6.2: get statistics for a specific sensor: 400", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/stats"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        start: "2023-10-01T12:30:00Z",
        endDate: "2023-10-01T12:00:00Z",
      });
    expect(res.status).toBe(400);
  });

  it("T6.3: get statistics for a specific sensor: 401", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/stats"
      )
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(401);
  });

  it("T6.4: get statistics for a specific sensor: 404", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET99/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/stats"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(404);
  });

  // get only outliers measurements for a specific sensor
  it("T7.1: get outliers for a specific sensor", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/outliers"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(200);
    console.log(res.body);
  });

  it("T7.2: get outliers for a specific sensor: 400", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/outliers"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        start: "2023-10-01T12:30:00Z",
        endDate: "2023-10-01T12:00:00Z",
      });
    expect(res.status).toBe(400);
  });

  it("T7.3: get outliers for a specific sensor: 401", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET01/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/outliers"
      )
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(401);
  });

  it("T7.4: get outliers for a specific sensor: 404", async () => {
    const res = await request(app)
      .get(
        "/api/v1/networks/NET99/gateways/00:00:00:00:00:01/sensors/00:00:00:00:00:01/outliers"
      )
      .set("Authorization", `Bearer ${adminToken}`)
      .query({
        startDate: "2023-10-01T12:00:00Z",
        endDate: "2023-10-01T12:30:00Z",
      });
    expect(res.status).toBe(404);
  });
});
