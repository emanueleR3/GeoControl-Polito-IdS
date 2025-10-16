/**
 * UserController Integration Tests
 *
 * Test Naming Convention: Tx.y
 * - T = Test
 * - x = Function/endpoint group number
 * - y = Test number within that group
 *
 * Function Groups:
 * - T1: getUser - Get single user by username with mapper service integration
 * - T2: getAllUsers - Get all users with mapper service integration
 * - T3: createUser - Create new user with mapper service integration
 * - T4: deleteUser - Delete user with mapper service integration
 *
 * Test Structure:
 * T1.1: Get user - successful mapper service integration
 * T1.2: Get user - mapper service integration with not found error
 * T2.1: Get all users - successful mapper service integration
 * T2.2: Get all users - mapper service integration with empty list
 * T3.1: Create user - successful mapper service integration
 * T3.2: Create user - mapper service integration with username conflict
 * T4.1: Delete user - successful mapper service integration
 * T4.2: Delete user - mapper service integration with not found error
 */

// filepath: c:\Users\eriks\OneDrive - Politecnico di Torino\Magistrale\A.A. 24-25\Software Engeneering\geocontrol\test\integration\controllers\userController.integration.test.ts
import * as userController from "@controllers/userController";
import { UserDAO } from "@dao/UserDAO";
import { UserType } from "@models/UserType";
import { UserRepository } from "@repositories/UserRepository";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@repositories/UserRepository");

describe("UserController integration", () => {
  it("T1.1: get User: mapperService integration", async () => {
    const fakeUserDAO: UserDAO = {
      username: "testuser",
      password: "secret",
      type: UserType.Operator,
    };

    const expectedDTO = {
      username: fakeUserDAO.username,
      type: fakeUserDAO.type,
    };

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(fakeUserDAO),
    }));

    const result = await userController.getUser("testuser");

    expect(result).toEqual({
      username: expectedDTO.username,
      type: expectedDTO.type,
    });
    expect(result).not.toHaveProperty("password");
  });

  it("T1.2: get User: mapperService integration with not found error", async () => {
    const fakeUsername = "testuser";

    const getUserMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(`User with username '${fakeUsername}' not found`);
    });
    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: getUserMock,
    }));

    await expect(userController.getUser(fakeUsername)).rejects.toThrow(
      NotFoundError
    );
  });

  it("T2.1: get All Users: mapperService integration", async () => {
    const fakeUserDAOs: UserDAO[] = [
      {
        username: "testuser",
        password: "secret",
        type: UserType.Operator,
      },
      {
        username: "testuser2",
        password: "secret",
        type: UserType.Admin,
      },
    ];

    const expectedDTOs = fakeUserDAOs.map((user) => ({
      username: user.username,
      type: user.type,
    }));

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getAllUsers: jest.fn().mockResolvedValue(fakeUserDAOs),
    }));

    const result = await userController.getAllUsers();
    expect(result).toEqual(expectedDTOs);
    expect(result[0]).not.toHaveProperty("password");
    expect(result[1]).not.toHaveProperty("password");
  });

  it("T2.2: get All Users: mapperService integration with empty list", async () => {
    const fakeUserDAOs: UserDAO[] = [];

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getAllUsers: jest.fn().mockResolvedValue(fakeUserDAOs),
    }));

    const result = await userController.getAllUsers();

    expect(result).toEqual([]);
  });

  it("T3.1: create User: mapperService integration", async () => {
    const fakeUserDTO = {
      username: "testuser",
      password: "secret",
      type: UserType.Viewer,
    };

    const createUserMock = jest.fn().mockResolvedValue(fakeUserDTO);
    (UserRepository as jest.Mock).mockImplementation(() => ({
      createUser: createUserMock,
    }));

    await userController.createUser(fakeUserDTO);

    expect(createUserMock).toHaveBeenCalledWith(
      fakeUserDTO.username,
      fakeUserDTO.password,
      fakeUserDTO.type
    );
  });

  it("T3.2: create User: mapperService integration with conflict error", async () => {
    const fakeUserDTO = {
      username: "testuser",
      password: "secret",
      type: UserType.Viewer,
    };

    const createUserMock = jest.fn().mockImplementation(() => {
      throw new ConflictError(
        `User with username '${fakeUserDTO.username}' already exists`
      );
    });
    (UserRepository as jest.Mock).mockImplementation(() => ({
      createUser: createUserMock,
    }));

    await expect(userController.createUser(fakeUserDTO)).rejects.toThrow(
      ConflictError
    );
  });

  it("T4.1: delete User: mapperService integration", async () => {
    const fakeUsername = "testuser";

    const deleteUserMock = jest.fn().mockResolvedValue(undefined);
    (UserRepository as jest.Mock).mockImplementation(() => ({
      deleteUser: deleteUserMock,
    }));

    await userController.deleteUser(fakeUsername);

    expect(deleteUserMock).toHaveBeenCalledWith(fakeUsername);
  });

  it("T4.2: delete User: mapperService integration with not found error", async () => {
    const fakeUsername = "testuser";

    const deleteUserMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(`User with username '${fakeUsername}' not found`);
    });
    (UserRepository as jest.Mock).mockImplementation(() => ({
      deleteUser: deleteUserMock,
    }));

    await expect(userController.deleteUser(fakeUsername)).rejects.toThrow(
      NotFoundError
    );
  });
});
