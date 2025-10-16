/**
 * @fileoverview Integration tests for Sensor Routes
 *
 * @description
 * This file contains integration tests for sensor-related API endpoints.
 * Tests are organized by endpoint groups and follow the naming convention Tx.y
 * where x represents the endpoint group and y represents the test number within that group.
 *
 * @testNamingConvention
 * T1.x - GET /api/v1/networks/:networkId/gateways/:gatewayId/sensors (Get All Sensors)
 *   T1.1 - Get all sensors (200 success)
 *   T1.2 - Get all sensors (401 unauthorized)
 *   T1.3 - Get all sensors (404 not found)
 *   T1.4 - Get all sensors (500 internal server error)
 *
 * T2.x - POST /api/v1/networks/:networkId/gateways/:gatewayId/sensors (Create Sensor)
 *   T2.1 - Create sensor (201 success)
 *   T2.2 - Create sensor (400 bad request)
 *   T2.3 - Create sensor (401 unauthorized)
 *   T2.4 - Create sensor (403 insufficient rights)
 *   T2.5 - Create sensor (404 not found)
 *   T2.6 - Create sensor (409 conflict)
 *   T2.7 - Create sensor (500 internal server error)
 *
 * T3.x - GET /api/v1/networks/:networkId/gateways/:gatewayId/sensors/:macAddress (Get Sensor by MAC Address)
 *   T3.1 - Get sensor by macAddress (200 success)
 *   T3.2 - Get sensor by macAddress (401 unauthorized)
 *   T3.3 - Get sensor by macAddress (404 not found)
 *   T3.4 - Get sensor by macAddress (500 internal server error)
 *
 * T4.x - PATCH /api/v1/networks/:networkId/gateways/:gatewayId/sensors/:macAddress (Update Sensor)
 *   T4.1 - Update sensor (200 success)
 *   T4.2 - Update sensor (400 bad request)
 *   T4.3 - Update sensor (401 unauthorized)
 *   T4.4 - Update sensor (403 insufficient rights)
 *   T4.5 - Update sensor (404 not found)
 *   T4.6 - Update sensor (409 conflict)
 *   T4.7 - Update sensor (500 internal server error)
 *
 * T5.x - DELETE /api/v1/networks/:networkId/gateways/:gatewayId/sensors/:macAddress (Delete Sensor)
 *   T5.1 - Delete sensor (204 success)
 *   T5.2 - Delete sensor (401 unauthorized)
 *   T5.3 - Delete sensor (403 insufficient rights)
 *   T5.4 - Delete sensor (404 not found)
 *   T5.5 - Delete sensor (500 internal server error)
 *
 * @totalTests 27
 * @coverage All sensor-related HTTP endpoints with comprehensive error handling scenarios
 */

import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as sensorController from "@controllers/sensorController";
import * as networkController from "@controllers/networkController";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { Network as NetworkDTO } from "@dto/Network";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { UserType } from "@models/UserType";

jest.mock("@services/authService");
jest.mock("@controllers/sensorController");
jest.mock("@controllers/networkController");

describe("SensorRoutes integration", () => {
  const token = "Bearer faketoken";
  const mockNetwork = {
    code: "net01",
    name: "Network 1",
    description: "Test Network",
    gateways: [
      {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Test Gateway"
      }
    ]
  };

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("T1.1: get all sensors", async () => {
    const mockSensors: SensorDTO[] = [
      {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Sensor 1",
        description: "description 1",
        variable: "temperature",
        unit: "C",
      },
      {
        macAddress: "00:11:22:33:44:55",
        name: "Sensor 2",
        description: "description 2",
        variable: "humidity",
        unit: "%",
      },
    ];

    (authService.processToken as jest.Mock).mockResolvedValue({ type: UserType.Admin });
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);
    (sensorController.getAllSensors as jest.Mock).mockResolvedValue(
      mockSensors
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSensors);
    expect(sensorController.getAllSensors).toHaveBeenCalled();
  });
  it("T1.2: get all sensors: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });
  it("T1.3: get all sensors: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getAllSensors as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Sensors not found");
    });
    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token);
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });
  it("T1.4: get all sensors: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getAllSensors as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch("Internal Server Error");
  });
  it("T2.1: create sensor", async () => {
    const mockSensor: SensorDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Sensor 1",
      description: "Description 1",
      variable: "temperature",
      unit: "C",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockResolvedValue(mockSensor);

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockSensor);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(sensorController.createSensor).toHaveBeenCalledWith(
      "AA:BB:CC:DD:EE:FF",
      mockSensor
    );
  });
  it("T2.2: create sensor: 400 Bad Request", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Bad Request");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      "request/body must have required property 'macAddress'"
    );
  });
  it("T2.3: create sensor: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", "Bearer invalid")
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        variable: "temperature",
        unit: "C",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });
  it("T2.4: create sensor: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        variable: "temperature",
        unit: "C",
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });
  it("T2.5: create sensor: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Gateway not found");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways/00:11:22:33:44:55/sensors")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        variable: "temperature",
        unit: "C",
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch("Gateway '00:11:22:33:44:55' not found in network 'net01'");
  });
  it("T2.6: create sensor: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict: Network already exists");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        variable: "temperature",
        unit: "C",
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/Conflict/);
  });
  it("T2.7: create sensor: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        variable: "temperature",
        unit: "C",
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch("Internal Server Error");
  });
  it("T3.1: get sensor by macAddress", async () => {
    const mockSensor: SensorDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
      variable: "temperature",
      unit: "C",
    };
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensor as jest.Mock).mockResolvedValue(mockSensor);
    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSensor);
    expect(sensorController.getSensor).toHaveBeenCalledWith(
      "AA:BB:CC:DD:EE:FF"
    );
  });
  it("T3.2: get sensor by macAddress: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });
  it("T3.3: get sensor by macAddress: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Sensor not found");
    });

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });
  it("T3.4: get sensor by macAddress: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch("Internal Server Error");
  });
  it("T4.1: update sensor", async () => {
    const mockSensor: SensorDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
      variable: "temperature",
      unit: "C",
    };
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .patch(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockSensor);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(sensorController.updateSensor).toHaveBeenCalledWith(
      "AA:BB:CC:DD:EE:FF",
      mockSensor
    );
  });
  it("T4.2: update sensor: 400 Bad Request", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Bad Request");
    });

    const response = await request(app)
      .patch(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: 123,
        description: "Description 1",
        variable: "temperature",
        unit: "C",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch("request/body/name must be string");
  });
  it("T4.3: update sensor: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .patch(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", "Bearer invalid")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });
  it("T4.4: update sensor: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .patch(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });
  it("T4.5: update sensor: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Sensor not found");
    });

    const response = await request(app)
      .patch(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });
  it("T4.6: update sensor: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict: Sensor already exists");
    });

    const response = await request(app)
      .patch(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/Conflict/);
  });
  it("T4.7: update sensor: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .patch(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch("Internal Server Error");
  });
  it("T5.1: delete sensor", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(sensorController.deleteSensor).toHaveBeenCalledWith(
      "AA:BB:CC:DD:EE:FF"
    );
  });
  it("T5.2: delete sensor: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });
  it("T5.3: delete sensor: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .delete(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });
  it("T5.4: delete sensor: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Sensor not found");
    });

    const response = await request(app)
      .delete(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });
  it("T5.5: delete sensor: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .delete(
        "/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF/sensors/AA:BB:CC:DD:EE:FF"
      )
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch("Internal Server Error");
  });
});
