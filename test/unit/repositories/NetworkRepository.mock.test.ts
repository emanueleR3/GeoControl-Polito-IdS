/**
 * NetworkRepository Mock Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Function being tested (1=getAllNetworks, 2=createNetwork, 3=getNetworkByCode, 4=updateNetwork, 5=deleteNetwork)
 * - y: Test number for that function
 *
 * Test Structure:
 * T1.1: get all networks - tests successful retrieval of all networks
 * T2.1: create network - tests successful network creation
 * T2.2: create network: conflict - tests creation failure when network code already exists
 * T3.1: get network by code - tests successful retrieval of network by code
 * T3.2: get network by code: not found - tests error when network code doesn't exist
 * T4.1: update network - tests successful network update
 * T4.2: update network: conflict - tests update failure when new code conflicts with existing network
 * T5.1: delete network - tests successful network deletion
 * T5.2: delete network: not found - tests error when trying to delete non-existent network
 */

const mockFind = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();
const mockUpdate = jest.fn();
const mockTransaction = jest.fn(async (work) => {
  const manager = {
    save: mockSave,
    remove: mockRemove,
    find: mockFind,
    update: mockUpdate,
  };
  return work(manager);
});

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
      remove: mockRemove,
      update: mockUpdate,
    }),
    transaction: mockTransaction,
  },
}));

import { NetworkRepository } from "@repositories/NetworkRepository";
import { NetworkDAO } from "@dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { AppDataSource } from "@database";

describe("NetworkRepository: mocked database", () => {
  const repo = new NetworkRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("T1.1: get all networks", async () => {
    const network1 = new NetworkDAO();
    network1.code = "network1";
    network1.name = "Network 1";
    network1.description = "Description 1";
    network1.gateways = [];

    const network2 = new NetworkDAO();
    network2.code = "network2";
    network2.name = "Network 2";
    network2.description = "Description 2";
    network2.gateways = [];

    mockFind.mockResolvedValue([network1, network2]);

    const result = await repo.getAllNetworks();

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(network1);
    expect(result[1]).toBe(network2);
  });

  it("T2.1: create network", async () => {
    mockFind.mockResolvedValue([]);

    const savedNetwork = new NetworkDAO();
    savedNetwork.code = "test_network";
    savedNetwork.name = "Test Network";
    savedNetwork.description = "Test network: description";
    savedNetwork.gateways = [];

    mockSave.mockResolvedValue(savedNetwork);

    const result = await repo.createNetwork(
      "test_network",
      "Test Network",
      "Test network: description"
    );

    expect(result).toBeInstanceOf(NetworkDAO);
    expect(result).toBe(savedNetwork);
    expect(mockSave).toHaveBeenCalled();
  });

  it("T2.2: create network: conflict", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "test_network";
    existingNetwork.name = "Test Network";
    existingNetwork.description = "Test network: description";
    existingNetwork.gateways = [];

    mockFind.mockResolvedValue([existingNetwork]);

    await expect(
      repo.createNetwork(
        "test_network",
        "Test Network",
        "Test network: description"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T3.1: get network by code", async () => {
    const found = new NetworkDAO();
    found.code = "test_network";
    found.name = "Test Network";
    found.description = "Test network: description";
    found.gateways = [];

    mockFind.mockResolvedValue([found]);

    const result = await repo.getNetworkByCode("test_network");
    expect(result).toBe(found);
    expect(result.code).toBe("test_network");
  });

  it("T3.2: get network by code: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.getNetworkByCode("non_existent_network")).rejects.toThrow(
      NotFoundError
    );
  });

  it("T4.1: update network", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "test_network";
    existingNetwork.name = "Test Network";
    existingNetwork.description = "Test network: description";
    existingNetwork.gateways = [];    const updatedNetwork = new NetworkDAO();
    updatedNetwork.code = "updated_network";
    updatedNetwork.name = "Updated Network";
    updatedNetwork.description = "Updated network: description";
    updatedNetwork.gateways = [];
    mockFind.mockResolvedValueOnce([existingNetwork]);
    mockFind.mockResolvedValueOnce([]);
    mockFind.mockResolvedValueOnce([updatedNetwork]);
    
    mockUpdate.mockResolvedValue({});
    mockSave.mockResolvedValue(updatedNetwork);

    const result = await repo.updateNetwork(
      "test_network",
      "updated_network",
      "Updated Network",
      "Updated network: description"
    );

    expect(result).toBeInstanceOf(NetworkDAO);
    expect(result).toBe(updatedNetwork);
  });

  it("T4.2: update network: conflict", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "test_network";
    existingNetwork.name = "Test Network";
    existingNetwork.description = "Test network: description";
    existingNetwork.gateways = [];

    const conflictingNetwork = new NetworkDAO();
    conflictingNetwork.code = "conflicting_network";
    conflictingNetwork.name = "Conflicting Network";
    conflictingNetwork.description = "Conflicting network: description";
    conflictingNetwork.gateways = [];

    mockFind.mockResolvedValue([existingNetwork, conflictingNetwork]);

    await expect(
      repo.updateNetwork(
        "test_network",
        "conflicting_network",
        "Updated Network",
        "Updated network: description"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T5.1: delete network", async () => {
    const existingNetwork = new NetworkDAO();
    existingNetwork.code = "test_network";
    existingNetwork.name = "Test Network";
    existingNetwork.description = "Test network: description";
    existingNetwork.gateways = [];

    mockFind.mockResolvedValue([existingNetwork]);

    await repo.deleteNetwork("test_network");

    expect(mockRemove).toHaveBeenCalledWith(existingNetwork);
  });

  it("T5.2: delete network: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.deleteNetwork("non_existent_network")).rejects.toThrow(
      NotFoundError
    );
  });
});
