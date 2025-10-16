/**
 * @fileoverview Integration tests for Network Routes
 *
 * @description
 * This file contains integration tests for network-related API endpoints.
 * Tests are organized by endpoint groups and follow the naming convention Tx.y
 * where x represents the endpoint group and y represents the test number within that group.
 *
 * @testNamingConvention
 * T1.x - GET /api/v1/networks (Get All Networks)
 *   T1.1 - Get all networks (200 success)
 *   T1.2 - Get all networks (401 unauthorized)
 *   T1.3 - Get all networks (500 internal server error)
 *
 * T2.x - POST /api/v1/networks (Create Network)
 *   T2.1 - Create network (201 success)
 *   T2.2 - Create network (400 bad request)
 *   T2.3 - Create network (401 unauthorized)
 *   T2.4 - Create network (403 insufficient rights)
 *   T2.5 - Create network (409 conflict)
 *   T2.6 - Create network (500 internal server error)
 *
 * T3.x - GET /api/v1/networks/:code (Get Network by Code)
 *   T3.1 - Get network by code (200 success)
 *   T3.2 - Get network by code (401 unauthorized)
 *   T3.3 - Get network by code (404 not found)
 *   T3.4 - Get network by code (500 internal server error)
 *
 * T4.x - PUT /api/v1/networks/:code (Update Network)
 *   T4.1 - Update network (200 success)
 *   T4.2 - Update network (400 bad request)
 *   T4.3 - Update network (401 unauthorized)
 *   T4.4 - Update network (403 insufficient rights)
 *   T4.5 - Update network (404 not found)
 *   T4.6 - Update network (409 conflict)
 *   T4.7 - Update network (500 internal server error)
 *
 * T5.x - DELETE /api/v1/networks/:code (Delete Network)
 *   T5.1 - Delete network (204 success)
 *   T5.2 - Delete network (401 unauthorized)
 *   T5.3 - Delete network (403 insufficient rights)
 *   T5.4 - Delete network (404 not found)
 *   T5.5 - Delete network (500 internal server error)
 *
 * @totalTests 25
 * @coverage All network-related HTTP endpoints with comprehensive error handling scenarios
 */

import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { Network as NetworkDTO } from "@dto/Network";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";
import { UserType } from "@models/UserType";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");

describe("NetworkRoutes integration", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("T1.1: get all networks", async () => {
    const mockNetworks: NetworkDTO[] = [
      { code: "1", name: "Network 1", description: "Description 1" },
      { code: "2", name: "Network 2", description: "Description 2" },
      { code: "3", name: "Network 3", description: "Description 3" },
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getAllNetworks as jest.Mock).mockResolvedValue(
      mockNetworks
    );

    const response = await request(app)
      .get("/api/v1/networks")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNetworks);
    expect(authService.processToken).toHaveBeenCalledWith(token, []);
    expect(networkController.getAllNetworks).toHaveBeenCalled();
  });

  it("T1.2: get all networks: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/networks")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T1.3: get all networks: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getAllNetworks as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/api/v1/networks")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T2.1: create network", async () => {
    const mockNetwork: NetworkDTO = {
      code: "1",
      name: "Network 1",
      description: "Description 1",
    };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockResolvedValue(
      mockNetwork
    );

    const response = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(mockNetwork);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(networkController.createNetwork).toHaveBeenCalledWith(mockNetwork);
  });

  it("T2.2: create network: 400 Bad Request", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Bad Request");
    });

    const response = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      "request/body must have required property 'code'"
    );
  });

  it("T2.3: create network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", "Bearer invalid")
      .set("Content-Type", "application/json")
      .send({ code: "1", name: "Network 1", description: "Description 1" });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T2.4: create network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({ code: "1", name: "Network 1", description: "Description 1" });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T2.5: create network: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict: Network already exists");
    });

    const response = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({ code: "1", name: "Network 1", description: "Description 1" });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/Conflict/);
  });

  it("T2.6: create network: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.createNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .post("/api/v1/networks")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({ code: "1", name: "Network 1", description: "Description 1" });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T3.1: get network by code", async () => {
    const mockNetwork: NetworkDTO = {
      code: "1",
      name: "Network 1",
      description: "Description 1",
    };
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);
    const response = await request(app)
      .get("/api/v1/networks/1")
      .set("Authorization", token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockNetwork);
    expect(authService.processToken).toHaveBeenCalledWith(token, []);
    expect(networkController.getNetwork).toHaveBeenCalledWith("1");
  });

  it("T3.2: get network by code: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/networks/1")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T3.3: get network by code: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Network not found");
    });

    const response = await request(app)
      .get("/api/v1/networks/1")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });

  it("T3.4: get network by code: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.getNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/api/v1/networks/1")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T4.1: update network", async () => {
    const mockNetwork: NetworkDTO = {
      code: "1",
      name: "Network 1",
      description: "Description 1",
    };
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .patch("/api/v1/networks/1")
      .set("Authorization", token)
      .send(mockNetwork);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(networkController.updateNetwork).toHaveBeenCalledWith(
      "1",
      mockNetwork
    );
  });

  it("T4.2: update network: 400 Bad Request", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Bad Request");
    });

    const response = await request(app)
      .patch("/api/v1/networks/1")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({
        code: "1",
        name: 123,
        description: "Description 1",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch("request/body/name must be string");
  });

  it("T4.3: update network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .patch("/api/v1/networks/1")
      .set("Authorization", "Bearer invalid")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });
  it("T4.4: update network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .patch("/api/v1/networks/1")
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });
  it("T4.5: update network: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Network not found");
    });

    const response = await request(app)
      .patch("/api/v1/networks/1")
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });
  it("T4.6: update network: 409 ConflictError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict: Network already exists");
    });

    const response = await request(app)
      .patch("/api/v1/networks/1")
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/Conflict/);
  });
  it("T4.7: update network: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .patch("/api/v1/networks/1")
      .set("Authorization", token)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T5.1: delete network", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete("/api/v1/networks/1")
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
      UserType.Operator,
    ]);
    expect(networkController.deleteNetwork).toHaveBeenCalledWith("1");
  });

  it("T5.2: delete network: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete("/api/v1/networks/1")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T5.3: delete network: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Insufficient rights");
    });

    const response = await request(app)
      .delete("/api/v1/networks/1")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T5.4: delete network: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: Network not found");
    });

    const response = await request(app)
      .delete("/api/v1/networks/1")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });

  it("T5.5: delete network: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (networkController.deleteNetwork as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .delete("/api/v1/networks/1")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });
});
