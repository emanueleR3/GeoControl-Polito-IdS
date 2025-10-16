/**
 * UserRepository Database Tests
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
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource,
} from "@test/setup/test-datasource";
import { UserType } from "@models/UserType";
import { UserDAO } from "@dao/UserDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(UserDAO).clear();
});

describe("UserRepository: SQLite in-memory", () => {
  const repo = new UserRepository();

  it("T1.1: create user", async () => {
    const user = await repo.createUser("john", "pass123", UserType.Admin);
    expect(user).toMatchObject({
      username: "john",
      password: "pass123",
      type: UserType.Admin,
    });

    const found = await repo.getUserByUsername("john");
    expect(found.username).toBe("john");
  });

  it("T1.2: create user: conflict", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    await expect(
      repo.createUser("john", "anotherpass", UserType.Viewer)
    ).rejects.toThrow(ConflictError);
  });

  it("T2.1: find user by username", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    const user = await repo.getUserByUsername("john");
    expect(user).toMatchObject({
      username: "john",
      password: "pass123",
      type: UserType.Admin,
    });
  });

  it("T2.2: find user by username: not found", async () => {
    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
  });

  it("T3.1: delete user", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    await repo.deleteUser("john");
    await expect(repo.getUserByUsername("john")).rejects.toThrow(NotFoundError);
  });

  it("T3.2: delete user: not found", async () => {
    await expect(repo.deleteUser("ghost")).rejects.toThrow(NotFoundError);
  });

  it("T4.1: get all users", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    await repo.createUser("jane", "pass456", UserType.Viewer);
    const users = await repo.getAllUsers();
    expect(users).toHaveLength(2);
    expect(users[0].username).toBe("john");
    expect(users[1].username).toBe("jane");
  });

  it("T4.2: get all users: empty", async () => {
    const users = await repo.getAllUsers();
    expect(users).toHaveLength(0);
  });
});
