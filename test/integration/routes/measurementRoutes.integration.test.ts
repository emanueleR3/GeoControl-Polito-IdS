/**
 * @fileoverview Integration tests for Measurement Routes
 *
 * @description
 * This file contains integration tests for measurement-related API endpoints.
 * Tests are organized by endpoint groups and follow the naming convention Tx.y
 * where x represents the endpoint group and y represents the test number within that group.
 *
 * @testNamingConvention
 * T1.x - GET /api/v1/networks/:networkId/measurements (Network Measurements)
 *   T1.1 - Get all measurements from network (200 success)
 *   T1.2 - Get filtered measurements from network (200 success with query params)
 *   T1.3 - Get all measurements from network (400 invalid data)
 *   T1.4 - Get all measurements from network (401 unauthorized)
 *   T1.5 - Get all measurements from network (404 not found)
 *   T1.6 - Get all measurements from network (500 internal server error)
 *
 * T2.x - GET /api/v1/networks/:networkId/stats (Network Stats)
 *   T2.1 - Get all stats from network (200 success)
 *   T2.2 - Get filtered stats from network (200 success with query params)
 *   T2.3 - Get all stats from network (400 invalid data)
 *   T2.4 - Get all stats from network (401 unauthorized)
 *   T2.5 - Get all stats from network (404 not found)
 *   T2.6 - Get all stats from network (500 internal server error)
 *
 * T3.x - GET /api/v1/networks/:networkId/outliers (Network Outliers)
 *   T3.1 - Get all outliers from network (200 success)
 *   T3.2 - Get filtered outliers from network (200 success with query params)
 *   T3.3 - Get all outliers from network (400 invalid data)
 *   T3.4 - Get all outliers from network (401 unauthorized)
 *   T3.5 - Get all outliers from network (404 not found)
 *   T3.6 - Get all outliers from network (500 internal server error)
 *
 * T4.x - POST /api/v1/networks/:networkId/gateways/:gatewayId/sensors/:sensorId/measurements (Create Measurements)
 *   T4.1 - Create measurement (201 success)
 *   T4.2 - Create measurement (400 invalid data)
 *   T4.3 - Create measurement (401 unauthorized)
 *   T4.4 - Create measurement (403 insufficient rights)
 *   T4.5 - Create measurement (404 not found)
 *   T4.6 - Create measurement (500 internal server error)
 *
 * T5.x - GET /api/v1/networks/:networkId/gateways/:gatewayId/sensors/:sensorId/measurements (Sensor Measurements)
 *   T5.1 - Get all measurements from sensor (200 success)
 *   T5.2 - Get filtered measurements from sensor (200 success with query params)
 *   T5.3 - Get all measurements from sensor (400 invalid data)
 *   T5.4 - Get all measurements from sensor (401 unauthorized)
 *   T5.5 - Get all measurements from sensor (404 not found)
 *   T5.6 - Get all measurements from sensor (500 internal server error)
 *
 * T6.x - GET /api/v1/networks/:networkId/gateways/:gatewayId/sensors/:sensorId/stats (Sensor Stats)
 *   T6.1 - Get all stats from sensor (200 success)
 *   T6.2 - Get filtered stats from sensor (200 success with query params)
 *   T6.3 - Get all stats from sensor (400 invalid data)
 *   T6.4 - Get all stats from sensor (401 unauthorized)
 *   T6.5 - Get all stats from sensor (404 not found)
 *   T6.6 - Get all stats from sensor (500 internal server error)
 *
 * T7.x - GET /api/v1/networks/:networkId/gateways/:gatewayId/sensors/:sensorId/outliers (Sensor Outliers)
 *   T7.1 - Get all outliers from sensor (200 success)
 *   T7.2 - Get filtered outliers from sensor (200 success with query params)
 *   T7.3 - Get all outliers from sensor (400 invalid data)
 *   T7.4 - Get all outliers from sensor (401 unauthorized)
 *   T7.5 - Get all outliers from sensor (404 not found)
 *   T7.6 - Get all outliers from sensor (500 internal server error)
 *
 * @totalTests 42
 * @coverage All measurement-related HTTP endpoints with comprehensive error handling scenarios
 */

import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as measurementController from "@controllers/measurementController";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats as StatsDTO } from "@dto/Stats";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { UserType } from "@models/UserType";
import e from "express";

jest.mock("@services/authService");
jest.mock("@controllers/measurementController");

describe("MeasurementRoutes integration", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("T1.1: get all measurements from network", async () => {
    const mockMeasurements: MeasurementsDTO[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          startDate: new Date("2025-02-18T15:00:00Z"),
          endDate: new Date("2025-02-18T17:00:00Z"),
          mean: 23.45,
          variance: 7.56,
          upperThreshold: 28.95,
          lowerThreshold: 17.95,
        },
        measurements: [
          {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.8567,
            isOutlier: false,
          },
        ],
      },
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getNetworkMeasurements as jest.Mock
    ).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/net01/measurements")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(measurementController.getNetworkMeasurements).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });

  it("T1.2: get filtered measurements from network", async () => {
    const mockMeasurements: MeasurementsDTO[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          startDate: new Date("2025-02-18T15:00:00Z"),
          endDate: new Date("2025-02-18T17:00:00Z"),
          mean: 23.45,
          variance: 7.56,
          upperThreshold: 28.95,
          lowerThreshold: 17.95,
        },
        measurements: [
          {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.8567,
            isOutlier: false,
          },
        ],
      },
    ];

    const sensorMacs = ["71:B1:CE:01:C6:A9", "22:33:44:55:66:77"];
    const startDate = new Date("2025-02-18T15:00:00Z").toISOString();
    const endDate = new Date("2025-02-18T17:00:00Z").toISOString();

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getNetworkMeasurements as jest.Mock
    ).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get("/api/v1/networks/net01/measurements")
      .set("Authorization", token)
      .query({
        sensorMacs: sensorMacs.join(","),
        startDate,
        endDate,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(measurementController.getNetworkMeasurements).toHaveBeenCalledWith(
      "net01",
      startDate,
      endDate,
      sensorMacs
    );
  });

  it("T1.3: get all measurements from network: 400 invalid data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getNetworkMeasurements as jest.Mock
    ).mockResolvedValue([]);

    const response = await request(app)
      .get("/api/v1/networks/net01/measurements")
      .set("Authorization", token)
      .query({
        startDate: "invalid-date",
        endDate: "invalid-date",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      'request/query/startDate must match format "date-time"'
    );
    expect(measurementController.getNetworkMeasurements).not.toHaveBeenCalled();
  });

  it("T1.4: get all measurements from network: 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized")
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/measurements")
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
    expect(measurementController.getNetworkMeasurements).not.toHaveBeenCalled();
  });

  it("T1.5: get all measurements from network: 404 not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getNetworkMeasurements as jest.Mock
    ).mockRejectedValue(new NotFoundError("Not Found"));

    const response = await request(app)
      .get("/api/v1/networks/net01/measurements")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
    expect(measurementController.getNetworkMeasurements).toHaveBeenCalled();
    expect(measurementController.getNetworkMeasurements).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });

  it("T1.6: get all measurements from network: 500 internal server error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getNetworkMeasurements as jest.Mock
    ).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app)
      .get("/api/v1/networks/net01/measurements")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(measurementController.getNetworkMeasurements).toHaveBeenCalled();
    expect(measurementController.getNetworkMeasurements).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });

  it("T2.1: get all stats from network", async () => {
    const mockStats: MeasurementsDTO[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          startDate: new Date("2025-02-18T15:00:00Z"),
          endDate: new Date("2025-02-18T17:00:00Z"),
          mean: 23.45,
          variance: 7.56,
          upperThreshold: 28.95,
          lowerThreshold: 17.95,
        },
      },
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkStats as jest.Mock).mockResolvedValue(
      mockStats
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/stats")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(measurementController.getNetworkStats).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });
  it("T2.2: get filtered stats from network", async () => {
    const mockStats: MeasurementsDTO[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          startDate: new Date("2025-02-18T15:00:00Z"),
          endDate: new Date("2025-02-18T17:00:00Z"),
          mean: 23.45,
          variance: 7.56,
          upperThreshold: 28.95,
          lowerThreshold: 17.95,
        },
      },
    ];

    const sensorMacs = ["71:B1:CE:01:C6:A9", "22:33:44:55:66:77"];
    const startDate = new Date("2025-02-18T15:00:00Z").toISOString();
    const endDate = new Date("2025-02-18T17:00:00Z").toISOString();

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkStats as jest.Mock).mockResolvedValue(
      mockStats
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/stats")
      .set("Authorization", token)
      .query({
        sensorMacs: sensorMacs.join(","),
        startDate,
        endDate,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(measurementController.getNetworkStats).toHaveBeenCalledWith(
      "net01",
      sensorMacs,
      startDate,
      endDate
    );
  });
  it("T2.3: get all stats from network: 400 invalid data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkStats as jest.Mock).mockResolvedValue([]);

    const response = await request(app)
      .get("/api/v1/networks/net01/stats")
      .set("Authorization", token)
      .query({
        startDate: "invalid-date",
        endDate: "invalid-date",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      'request/query/startDate must match format "date-time"'
    );
    expect(measurementController.getNetworkStats).not.toHaveBeenCalled();
  });
  it("T2.4: get all stats from network: 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized")
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/stats")
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
    expect(measurementController.getNetworkStats).not.toHaveBeenCalled();
  });

  it("T2.5: get all stats from network: 404 not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkStats as jest.Mock).mockRejectedValue(
      new NotFoundError("Not Found")
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/stats")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
    expect(measurementController.getNetworkStats).toHaveBeenCalled();
    expect(measurementController.getNetworkStats).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });

  it("T2.6: get all stats from network: 500 internal server error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkStats as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/stats")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(measurementController.getNetworkStats).toHaveBeenCalled();
    expect(measurementController.getNetworkStats).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });

  it("T3.1: get all outliers from network", async () => {
    const mockOutliers: MeasurementsDTO[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          startDate: new Date("2025-02-18T15:00:00Z"),
          endDate: new Date("2025-02-18T17:00:00Z"),
          mean: 23.45,
          variance: 7.56,
          upperThreshold: 28.95,
          lowerThreshold: 17.95,
        },
        measurements: [
          {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.8567,
            isOutlier: false,
          },
        ],
      },
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkOutliers as jest.Mock).mockResolvedValue(
      mockOutliers
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOutliers);
    expect(measurementController.getNetworkOutliers).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });
  it("T3.2: get filtered outliers from network", async () => {
    const mockOutliers: MeasurementsDTO[] = [
      {
        sensorMacAddress: "71:B1:CE:01:C6:A9",
        stats: {
          startDate: new Date("2025-02-18T15:00:00Z"),
          endDate: new Date("2025-02-18T17:00:00Z"),
          mean: 23.45,
          variance: 7.56,
          upperThreshold: 28.95,
          lowerThreshold: 17.95,
        },
        measurements: [
          {
            createdAt: new Date("2025-02-18T16:00:00Z"),
            value: 21.8567,
            isOutlier: false,
          },
        ],
      },
    ];

    const sensorMacs = ["71:B1:CE:01:C6:A9", "22:33:44:55:66:77"];
    const startDate = new Date("2025-02-18T15:00:00Z").toISOString();
    const endDate = new Date("2025-02-18T17:00:00Z").toISOString();

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkOutliers as jest.Mock).mockResolvedValue(
      mockOutliers
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/outliers")
      .set("Authorization", token)
      .query({
        sensorMacs: sensorMacs.join(","),
        startDate,
        endDate,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOutliers);
    expect(measurementController.getNetworkOutliers).toHaveBeenCalledWith(
      "net01",
      sensorMacs,
      startDate,
      endDate
    );
  });

  it("T3.3: get all outliers from network: 400 invalid data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkOutliers as jest.Mock).mockResolvedValue(
      []
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/outliers")
      .set("Authorization", token)
      .query({
        startDate: "invalid-date",
        endDate: "invalid-date",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      'request/query/startDate must match format "date-time"'
    );
    expect(measurementController.getNetworkOutliers).not.toHaveBeenCalled();
  });

  it("T3.4: get all outliers from network: 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized")
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
    expect(measurementController.getNetworkOutliers).not.toHaveBeenCalled();
  });
  it("T3.5: get all outliers from network: 404 not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkOutliers as jest.Mock).mockRejectedValue(
      new NotFoundError("Not Found")
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
    expect(measurementController.getNetworkOutliers).toHaveBeenCalled();
    expect(measurementController.getNetworkOutliers).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });
  it("T3.6: get all outliers from network: 500 internal server error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getNetworkOutliers as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/outliers")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(measurementController.getNetworkOutliers).toHaveBeenCalled();
    expect(measurementController.getNetworkOutliers).toHaveBeenCalledWith(
      "net01",
      undefined,
      undefined,
      undefined
    );
  });

  it("T4.1: create measurement", async () => {
    const networkCode = "net01";
    const gatewayMac = "71:B1:CE:01:C6:A9";
    const sensorMac = "22:33:44:55:66:77";
    const createdAt = new Date("2025-02-18T16:00:00Z");
    const value = 21.8567;

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.createSensorMeasurement as jest.Mock
    ).mockResolvedValue(undefined);

    const response = await request(app)
      .post(
        `/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}/measurements`
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send([
        {
          createdAt: createdAt.toISOString(),
          value: value,
        },
      ]);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(measurementController.createSensorMeasurement).toHaveBeenCalledWith(
      networkCode,
      gatewayMac,
      sensorMac,
      createdAt,
      value
    );
  });

  it("T4.2: create measurement: 400 invalid data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.createSensorMeasurement as jest.Mock
    ).mockResolvedValue(undefined);

    const response = await request(app)
      .post(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send([
        {
          createdAt: "invalid-date",
          value: "invalid-value",
        },
      ]);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      'request/body/0/createdAt must match format "date-time"'
    );
    expect(
      measurementController.createSensorMeasurement
    ).not.toHaveBeenCalled();
  });
  it("T4.3: create measurement: 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized")
    );

    const response = await request(app)
      .post(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send([
        {
          createdAt: new Date().toISOString(),
          value: 21.8567,
        },
      ]);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
    expect(
      measurementController.createSensorMeasurement
    ).not.toHaveBeenCalled();
  });
  it("T4.4: create measurement: 403 insufficient rights", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.createSensorMeasurement as jest.Mock
    ).mockRejectedValue(new InsufficientRightsError("Insufficient rights"));

    const response = await request(app)
      .post(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send([
        {
          createdAt: new Date().toISOString(),
          value: 21.8567,
        },
      ]);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Insufficient rights");
    expect(measurementController.createSensorMeasurement).toHaveBeenCalled();
  });

  it("T4.5: create measurement: 404 not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.createSensorMeasurement as jest.Mock
    ).mockRejectedValue(new NotFoundError("Not Found"));

    const response = await request(app)
      .post(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send([
        {
          createdAt: new Date().toISOString(),
          value: 21.8567,
        },
      ]);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
    expect(measurementController.createSensorMeasurement).toHaveBeenCalled();
  });

  it("T4.6: create measurement: 500 internal server error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.createSensorMeasurement as jest.Mock
    ).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app)
      .post(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send([
        {
          createdAt: new Date().toISOString(),
          value: 21.8567,
        },
      ]);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(measurementController.createSensorMeasurement).toHaveBeenCalled();
  });

  it("T5.1: get all measurements from sensor", async () => {
    const mockMeasurements: MeasurementsDTO = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        startDate: new Date("2025-02-18T15:00:00Z"),
        endDate: new Date("2025-02-18T17:00:00Z"),
        mean: 23.45,
        variance: 7.56,
        upperThreshold: 28.95,
        lowerThreshold: 17.95,
      },
      measurements: [
        {
          createdAt: new Date("2025-02-18T16:00:00Z"),
          value: 21.8567,
          isOutlier: false,
        },
      ],
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getSensorMeasurementWithStats as jest.Mock
    ).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(
      measurementController.getSensorMeasurementWithStats
    ).toHaveBeenCalledWith(
      "net01",
      "71:B1:CE:01:C6:A9",
      "22:33:44:55:66:77",
      undefined,
      undefined
    );
  });

  it("T5.2: get filtered measurements from sensor", async () => {
    const mockMeasurements: MeasurementsDTO = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        startDate: new Date("2025-02-18T15:00:00Z"),
        endDate: new Date("2025-02-18T17:00:00Z"),
        mean: 23.45,
        variance: 7.56,
        upperThreshold: 28.95,
        lowerThreshold: 17.95,
      },
      measurements: [
        {
          createdAt: new Date("2025-02-18T16:00:00Z"),
          value: 21.8567,
          isOutlier: false,
        },
      ],
    };

    const startDate = new Date("2025-02-18T15:00:00Z").toISOString();
    const endDate = new Date("2025-02-18T17:00:00Z").toISOString();

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getSensorMeasurementWithStats as jest.Mock
    ).mockResolvedValue(mockMeasurements);

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token)
      .query({
        startDate,
        endDate,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockMeasurements);
    expect(
      measurementController.getSensorMeasurementWithStats
    ).toHaveBeenCalledWith(
      "net01",
      "71:B1:CE:01:C6:A9",
      "22:33:44:55:66:77",
      startDate,
      endDate
    );
  });

  it("T5.3: get all measurements from sensor: 400 invalid data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getSensorMeasurementWithStats as jest.Mock
    ).mockResolvedValue({} as MeasurementsDTO);

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token)
      .query({
        startDate: "invalid-date",
        endDate: "invalid-date",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      'request/query/startDate must match format "date-time"'
    );
    expect(
      measurementController.getSensorMeasurementWithStats
    ).not.toHaveBeenCalled();
  });
  it("T5.4: get all measurements from sensor: 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized")
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
    expect(
      measurementController.getSensorMeasurementWithStats
    ).not.toHaveBeenCalled();
  });
  it("T5.5: get all measurements from sensor: 404 not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getSensorMeasurementWithStats as jest.Mock
    ).mockRejectedValue(new NotFoundError("Not Found"));

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
    expect(
      measurementController.getSensorMeasurementWithStats
    ).toHaveBeenCalled();
  });
  it("T5.6: get all measurements from sensor: 500 internal server error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (
      measurementController.getSensorMeasurementWithStats as jest.Mock
    ).mockRejectedValue(new Error("Internal Server Error"));

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/measurements"
      )
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(
      measurementController.getSensorMeasurementWithStats
    ).toHaveBeenCalled();
  });

  it("T6.1: get all stats from sensor", async () => {
    const mockStats: StatsDTO = {
      startDate: new Date("2025-02-18T15:00:00Z"),
      endDate: new Date("2025-02-18T17:00:00Z"),
      mean: 23.45,
      variance: 7.56,
      upperThreshold: 28.95,
      lowerThreshold: 17.95,
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorStats as jest.Mock).mockResolvedValue(
      mockStats
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/stats"
      )
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(measurementController.getSensorStats).toHaveBeenCalledWith(
      "net01",
      "71:B1:CE:01:C6:A9",
      "22:33:44:55:66:77",
      undefined,
      undefined
    );
  });

  it("T6.2: get filtered stats from sensor", async () => {
    const mockStats: StatsDTO = {
      startDate: new Date("2025-02-18T15:00:00Z"),
      endDate: new Date("2025-02-18T17:00:00Z"),
      mean: 23.45,
      variance: 7.56,
      upperThreshold: 28.95,
      lowerThreshold: 17.95,
    };

    const startDate = new Date("2025-02-18T15:00:00Z").toISOString();
    const endDate = new Date("2025-02-18T17:00:00Z").toISOString();

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorStats as jest.Mock).mockResolvedValue(
      mockStats
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/stats"
      )
      .set("Authorization", token)
      .query({
        startDate,
        endDate,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStats);
    expect(measurementController.getSensorStats).toHaveBeenCalledWith(
      "net01",
      "71:B1:CE:01:C6:A9",
      "22:33:44:55:66:77",
      startDate,
      endDate
    );
  });

  it("T6.3: get all stats from sensor: 400 invalid data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorStats as jest.Mock).mockResolvedValue(
      {} as StatsDTO
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/stats"
      )
      .set("Authorization", token)
      .query({
        startDate: "invalid-date",
        endDate: "invalid-date",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      'request/query/startDate must match format "date-time"'
    );
    expect(measurementController.getSensorStats).not.toHaveBeenCalled();
  });
  it("T6.4: get all stats from sensor: 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized")
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/stats"
      )
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
    expect(measurementController.getSensorStats).not.toHaveBeenCalled();
  });
  it("T6.5: get all stats from sensor: 404 not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorStats as jest.Mock).mockRejectedValue(
      new NotFoundError("Not Found")
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/stats"
      )
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
    expect(measurementController.getSensorStats).toHaveBeenCalled();
  });
  it("T6.6: get all stats from sensor: 500 internal server error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorStats as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/stats"
      )
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(measurementController.getSensorStats).toHaveBeenCalled();
  });

  it("T7.1: get all outliers from sensor", async () => {
    const mockOutliers: MeasurementsDTO = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        startDate: new Date("2025-02-18T15:00:00Z"),
        endDate: new Date("2025-02-18T17:00:00Z"),
        mean: 23.45,
        variance: 7.56,
        upperThreshold: 28.95,
        lowerThreshold: 17.95,
      },
      measurements: [
        {
          createdAt: new Date("2025-02-18T16:00:00Z"),
          value: 21.8567,
          isOutlier: false,
        },
      ],
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorOutliers as jest.Mock).mockResolvedValue(
      mockOutliers
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/outliers"
      )
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOutliers);
    expect(measurementController.getSensorOutliers).toHaveBeenCalledWith(
      "net01",
      "71:B1:CE:01:C6:A9",
      "22:33:44:55:66:77",
      undefined,
      undefined
    );
  });

  it("T7.2: get filtered outliers from sensor", async () => {
    const mockOutliers: MeasurementsDTO = {
      sensorMacAddress: "71:B1:CE:01:C6:A9",
      stats: {
        startDate: new Date("2025-02-18T15:00:00Z"),
        endDate: new Date("2025-02-18T17:00:00Z"),
        mean: 23.45,
        variance: 7.56,
        upperThreshold: 28.95,
        lowerThreshold: 17.95,
      },
      measurements: [
        {
          createdAt: new Date("2025-02-18T16:00:00Z"),
          value: 21.8567,
          isOutlier: false,
        },
      ],
    };

    const startDate = new Date("2025-02-18T15:00:00Z").toISOString();
    const endDate = new Date("2025-02-18T17:00:00Z").toISOString();

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorOutliers as jest.Mock).mockResolvedValue(
      mockOutliers
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/outliers"
      )
      .set("Authorization", token)
      .query({
        startDate,
        endDate,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOutliers);
    expect(measurementController.getSensorOutliers).toHaveBeenCalledWith(
      "net01",
      "71:B1:CE:01:C6:A9",
      "22:33:44:55:66:77",
      startDate,
      endDate
    );
  });

  it("T7.3: get all outliers from sensor: 400 invalid data", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorOutliers as jest.Mock).mockResolvedValue(
      {} as MeasurementsDTO
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/outliers"
      )
      .set("Authorization", token)
      .query({
        startDate: "invalid-date",
        endDate: "invalid-date",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      'request/query/startDate must match format "date-time"'
    );
    expect(measurementController.getSensorOutliers).not.toHaveBeenCalled();
  });
  it("T7.4: get all outliers from sensor: 401 unauthorized", async () => {
    (authService.processToken as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized")
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/outliers"
      )
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
    expect(measurementController.getSensorOutliers).not.toHaveBeenCalled();
  });
  it("T7.5: get all outliers from sensor: 404 not found", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorOutliers as jest.Mock).mockRejectedValue(
      new NotFoundError("Not Found")
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/outliers"
      )
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Not Found");
    expect(measurementController.getSensorOutliers).toHaveBeenCalled();
  });
  it("T7.6: get all outliers from sensor: 500 internal server error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (measurementController.getSensorOutliers as jest.Mock).mockRejectedValue(
      new Error("Internal Server Error")
    );

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/71:B1:CE:01:C6:A9/sensors/22:33:44:55:66:77/outliers"
      )
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Internal Server Error");
    expect(measurementController.getSensorOutliers).toHaveBeenCalled();
  });
});
