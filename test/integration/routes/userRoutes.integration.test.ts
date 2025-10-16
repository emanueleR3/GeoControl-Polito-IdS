/**
 * @fileoverview Integration tests for User Routes
 *
 * @description
 * This file contains integration tests for user-related API endpoints.
 * Tests are organized by endpoint groups and follow the naming convention Tx.y
 * where x represents the endpoint group and y represents the test number within that group.
 *
 * @testNamingConvention
 * T1.x - GET /api/v1/users (Get All Users)
 *   T1.1 - Get all users (200 success)
 *   T1.2 - Get all users (401 unauthorized)
 *   T1.3 - Get all users (403 insufficient rights)
 *   T1.4 - Get all users (500 internal server error)
 *
 * T2.x - POST /api/v1/users (Create User)
 *   T2.1 - Create user (201 success)
 *   T2.2 - Create user (400 bad request)
 *   T2.3 - Create user (401 unauthorized)
 *   T2.4 - Create user (403 insufficient rights)
 *   T2.5 - Create user (409 conflict)
 *   T2.6 - Create user (500 internal server error)
 *
 * T3.x - GET /api/v1/users/:username (Get User by Username)
 *   T3.1 - Get user by username (200 success)
 *   T3.2 - Get user by username (401 unauthorized)
 *   T3.3 - Get user by username (403 insufficient rights)
 *   T3.4 - Get user by username (404 not found)
 *   T3.5 - Get user by username (500 internal server error)
 *
 * T4.x - DELETE /api/v1/users/:username (Delete User)
 *   T4.1 - Delete user (204 success)
 *   T4.2 - Delete user (401 unauthorized)
 *   T4.3 - Delete user (403 insufficient rights)
 *   T4.4 - Delete user (404 not found)
 *   T4.5 - Delete user (500 internal server error)
 *
 * @totalTests 20
 * @coverage All user-related HTTP endpoints with comprehensive error handling scenarios
 */

import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as userController from "@controllers/userController";
import { UserType } from "@models/UserType";
import { User as UserDTO } from "@dto/User";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/userController");

describe("UserRoutes integration", () => {
  const token = "Bearer faketoken";

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("T1.1: get all users", async () => {
    const mockUsers: UserDTO[] = [
      { username: "admin", type: UserType.Admin },
      { username: "viewer", type: UserType.Viewer },
    ];

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
    ]);
    expect(userController.getAllUsers).toHaveBeenCalled();
  });
  it("T1.2: get all users: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T1.3: get all users: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T1.4: get all users: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getAllUsers as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T2.1: create user", async () => {
    const newUser: UserDTO = {
      username: "newuser",
      password: "password",
      type: "viewer",
    };
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockResolvedValue(newUser);

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
    ]);
    expect(userController.createUser).toHaveBeenCalledWith(newUser);
  });

  it("T2.2: create user: 400 Bad Request", async () => {
    const invalidUser = { username: "", type: "viewer" };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockImplementation(() => {
      throw new Error("Bad Request");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(
      "request/body must have required property 'password'"
    );
  });

  it("T2.3: create user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", "Bearer invalid")
      .set("Content-Type", "application/json")
      .send({ username: "newuser", password: "password", type: "viewer" });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T2.4: create user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({ username: "newuser", password: "password", type: "viewer" });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T2.5: create user: 409 Conflict", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockImplementation(() => {
      throw new ConflictError("Conflict: User already exists");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({ username: "existinguser", password: "password", type: "viewer" });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/Conflict/);
  });

  it("T2.6: create user: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.createUser as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .send({ username: "newuser", password: "password", type: "viewer" });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T3.1: get user by username", async () => {
    const mockUser: UserDTO = { username: "admin", type: UserType.Admin };

    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
    ]);
    expect(userController.getUser).toHaveBeenCalledWith("admin");
  });

  it("T3.2: get user by username: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T3.3: get user by username: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T3.4: get user by username: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getUser as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: User not found");
    });

    const response = await request(app)
      .get("/api/v1/users/nonexistentuser")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });

  it("T3.5: get user by username: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.getUser as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });

  it("T4.1: delete user", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app)
      .delete("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(204);
    expect(authService.processToken).toHaveBeenCalledWith(token, [
      UserType.Admin,
    ]);
    expect(userController.deleteUser).toHaveBeenCalledWith("admin");
  });

  it("T4.2: delete user: 401 UnauthorizedError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError("Unauthorized: No token provided");
    });

    const response = await request(app)
      .delete("/api/v1/users/admin")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Unauthorized/);
  });

  it("T4.3: delete user: 403 InsufficientRightsError", async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new InsufficientRightsError("Forbidden: Insufficient rights");
    });

    const response = await request(app)
      .delete("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/Insufficient rights/);
  });

  it("T4.4: delete user: 404 NotFoundError", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockImplementation(() => {
      throw new NotFoundError("Not Found: User not found");
    });

    const response = await request(app)
      .delete("/api/v1/users/nonexistentuser")
      .set("Authorization", token);

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Not Found/);
  });

  it("T4.5: delete user: 500 Internal Server Error", async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (userController.deleteUser as jest.Mock).mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .delete("/api/v1/users/admin")
      .set("Authorization", token);

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Internal Server Error/);
  });
});
