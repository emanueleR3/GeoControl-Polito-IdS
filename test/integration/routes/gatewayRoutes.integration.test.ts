/**
 * GatewayRoutes Integration Tests
 *
 * Test Naming Convention: Tx.y
 * - T = Test
 * - x = Endpoint group number
 * - y = Test number within that group (HTTP status code specific)
 *
 * Endpoint Groups:
 * - T1: GET /api/v1/networks/:networkCode/gateways - Get all gateways
 * - T2: POST /api/v1/networks/:networkCode/gateways - Create gateway
 * - T3: GET /api/v1/networks/:networkCode/gateways/:macAddress - Get gateway by MAC address
 * - T4: PATCH /api/v1/networks/:networkCode/gateways/:macAddress - Update gateway
 * - T5: DELETE /api/v1/networks/:networkCode/gateways/:macAddress - Delete gateway
 *
 * Test Structure:
 * T1.1: Get all gateways - 200 success
 * T1.2: Get all gateways - 401 unauthorized error
 * T1.3: Get all gateways - 404 not found error
 * T1.4: Get all gateways - 500 internal server error
 * T2.1: Create gateway - 201 success
 * T2.2: Create gateway - 400 bad request
 * T2.3: Create gateway - 401 unauthorized error
 * T2.4: Create gateway - 403 insufficient rights error
 * T2.5: Create gateway - 409 conflict error
 * T2.6: Create gateway - 500 internal server error
 * T3.1: Get gateway by MAC address - 200 success
 * T3.2: Get gateway by MAC address - 401 unauthorized error
 * T3.3: Get gateway by MAC address - 404 not found error
 * - T3.3.1: Get gateway by MAC address - 404 not found error - specific message
 * T3.4: Get gateway by MAC address - 500 internal server error
 * T4.1: Update gateway - 204 success
 * T4.2: Update gateway - 400 bad request
 * T4.3: Update gateway - 401 unauthorized error
 * T4.4: Update gateway - 403 insufficient rights error
 * T4.5: Update gateway - 404 not found error
 * T4.6: Update gateway - 409 conflict error
 * T4.7: Update gateway - 500 internal server error
 * T5.1: Delete gateway - 204 success
 * T5.2: Delete gateway - 401 unauthorized error
 * T5.3: Delete gateway - 403 insufficient rights error
 * T5.4: Delete gateway - 404 not found error
 * T5.5: Delete gateway - 500 internal server error
 */

// filepath: c:\Users\eriks\OneDrive - Politecnico di Torino\Magistrale\A.A. 24-25\Software Engeneering\geocontrol\test\integration\routes\gatewayRoutes.integration.test.ts
import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as gatewayController from "@controllers/gatewayController";
import * as networkController from "@controllers/networkController";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { UserType } from "@models/UserType";

jest.mock("@services/authService");
jest.mock("@controllers/gatewayController");
jest.mock("@controllers/networkController");

describe("GatewayRoutes integration", () => {
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

  it("T1.1: get all gateways", async () => {
    const mockGateways: GatewayDTO[] = [
      {
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "description 1",
      },
      {
        macAddress: "00:11:22:33:44:55",
        name: "Gateway 2",
        description: "description 2",
      },
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getAllGateways as jest.Mock).mockResolvedValue(
      mockGateways
    );

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGateways);
    expect(gatewayController.getAllGateways).toHaveBeenCalled();
  });

  it("T1.2: get all gateways: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T1.3: get all gateways: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getAllGateways as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Gateways not found");
    });
    const response = await request(app)
      .get("/api/v1/networks/net01/gateways")
      .set("Authorization", token);
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });

  it("T1.4: get all gateways: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.getAllGateways as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T2.1: create gateway", async () => {
    const mockgateway: GatewayDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
      sensors: undefined,
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockResolvedValue(
      mockgateway
    );

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockgateway);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(gatewayController.createGateway).toHaveBeenCalledWith(
      "net01",
      mockgateway
    );
  });

  it("T2.2: create gateway: 400 Bad Request", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new Error("Bad Request");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways")
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      "request/body must have required property 'macAddress'"
    );
  });

  it("T2.3: create gateway: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways")
      .set("Authorization", "Bearer invalid")
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        sensors: undefined,
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T2.4: create gateway: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        sensors: undefined,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T2.5: create gateway: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict: Network already exists");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        sensors: undefined,
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/Conflict/);
  });

  it("T2.6: create gateway: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .post("/api/v1/networks/net01/gateways")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Gateway 1",
        description: "Description 1",
        sensors: undefined,
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T3.1: get gateway by macAddress", async () => {
    const mockGateway: GatewayDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
    };
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);
    (gatewayController.getGateway as jest.Mock).mockResolvedValue(mockGateway);
    
    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockGateway);
  });

  it("T3.2: get gateway by macAddress: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T3.3: get gateway by macAddress: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue({
      ...mockNetwork,
      gateways: []
    });

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Gateway 'AA:BB:CC:DD:EE:FF' not found in network 'net01'/);
  });

  it("T3.4: get gateway by macAddress: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T4.1: update gateway", async () => {
    const mockGateway: GatewayDTO = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1 Updated",
      description: "Description 1 Updated",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);
    (gatewayController.updateGateway as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .patch("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockGateway);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("T4.2: update gateway: 400 Bad Request", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
      throw new Error("Bad Request");
    });

    const response = await request(app)
      .patch("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: 1,
        description: "Description 1",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch("request/body/name must be string");
  });

  it("T4.3: update gateway: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .patch("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", "Bearer invalid")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });
  it("T4.4: update gateway: 403 InsufficientRightsError", async () => {
    const mockGateway = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .patch("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockGateway);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });
  it("T4.5: update gateway: 404 NotFoundError", async () => {
    const mockGateway = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue({
      ...mockNetwork,
      gateways: []
    });

    const response = await request(app)
      .patch("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockGateway);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Gateway 'AA:BB:CC:DD:EE:FF' not found in network 'net01'/);
  });
  it("T4.6: update gateway: 409 ConflictError", async () => {
    const mockGateway = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);
    (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Gateway with this MAC address already exists");
    });

    const response = await request(app)
      .patch("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockGateway);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/Gateway with this MAC address already exists/);
  });
  it("T4.7: update gateway: 500 Internal Server Error", async () => {
    const mockGateway = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Gateway 1",
      description: "Description 1",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .patch("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockGateway);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T5.1: delete gateway", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);
    (gatewayController.deleteGateway as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("T5.2: delete gateway: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T5.3: delete gateway: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (gatewayController.deleteGateway as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .delete("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T5.4: delete gateway: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue({
      ...mockNetwork,
      gateways: []
    });

    const response = await request(app)
      .delete("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Gateway 'AA:BB:CC:DD:EE:FF' not found in network 'net01'/);
  });

  it("T5.5: delete gateway: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .delete("/api/v1/networks/net01/gateways/AA:BB:CC:DD:EE:FF")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });
});
