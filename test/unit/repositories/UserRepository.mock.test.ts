/**
 * UserRepository Mock Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Function being tested (1=createUser, 2=getUserByUsername, 3=deleteUser, 4=getAllUsers)
 * - y: Test number for that function
 *
 * Test Structure:
 * T1.1: create user - tests successful user creation
 * T1.2: create user: conflict - tests creation failure when username already exists
 * T2.1: find user by username - tests successful retrieval of user by username
 * T2.2: find user by username: not found - tests error when username doesn't exist
 * T3.1: delete user - tests successful user deletion
 * T3.2: delete user: not found - tests error when trying to delete non-existent user
 * T4.1: get all users - tests successful retrieval of all users
 * T4.2: get all users: empty - tests retrieval when no users exist
 */

import { UserRepository } from "@repositories/UserRepository";
import { UserDAO } from "@dao/UserDAO";
import { UserType } from "@models/UserType";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove,
    }),
  },
}));

describe("UserRepository: mocked database", () => {
  const repo = new UserRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("T1.1: create user", async () => {
    mockFind.mockResolvedValue([]);

    const savedUser = new UserDAO();
    savedUser.username = "john";
    savedUser.password = "pass123";
    savedUser.type = UserType.Admin;

    mockSave.mockResolvedValue(savedUser);

    const result = await repo.createUser("john", "pass123", UserType.Admin);

    expect(result).toBeInstanceOf(UserDAO);
    expect(result.username).toBe("john");
    expect(result.password).toBe("pass123");
    expect(result.type).toBe(UserType.Admin);
    expect(mockSave).toHaveBeenCalledWith({
      username: "john",
      password: "pass123",
      type: UserType.Admin,
    });
  });

  it("T1.2: create user: conflict", async () => {
    const existingUser = new UserDAO();
    existingUser.username = "john";
    existingUser.password = "pass123";
    existingUser.type = UserType.Admin;

    mockFind.mockResolvedValue([existingUser]);

    await expect(
      repo.createUser("john", "another", UserType.Viewer)
    ).rejects.toThrow(ConflictError);
  });

  it("T2.1: find user by username", async () => {
    const foundUser = new UserDAO();
    foundUser.username = "john";
    foundUser.password = "pass123";
    foundUser.type = UserType.Operator;

    mockFind.mockResolvedValue([foundUser]);

    const result = await repo.getUserByUsername("john");
    expect(result).toBe(foundUser);
    expect(result.type).toBe(UserType.Operator);
  });

  it("T2.2: find user by username: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
  });

  it("T3.1: delete user", async () => {
    const user = new UserDAO();
    user.username = "john";
    user.password = "pass123";
    user.type = UserType.Admin;

    mockFind.mockResolvedValue([user]);
    mockRemove.mockResolvedValue(undefined);

    await repo.deleteUser("john");

    expect(mockRemove).toHaveBeenCalledWith(user);
  });

  it("T3.2: delete user: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.deleteUser("ghost")).rejects.toThrow(NotFoundError);
  });

  it("T4.1: get all users", async () => {
    const user1 = new UserDAO();
    user1.username = "john";
    user1.password = "pass123";

    const user2 = new UserDAO();
    user2.username = "jane";
    user2.password = "pass456";

    mockFind.mockResolvedValue([user1, user2]);
    const result = await repo.getAllUsers();
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(user1);
    expect(result[1]).toBe(user2);
    expect(mockFind).toHaveBeenCalled();
  });

  it("T4.2: get all users: empty", async () => {
    mockFind.mockResolvedValue([]);

    const result = await repo.getAllUsers();
    expect(result).toHaveLength(0);
    expect(mockFind).toHaveBeenCalled();
  });
});
