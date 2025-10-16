/**
 * Test naming convention: Tx.y where x represents the function being tested and y represents the nth test for that same function
 *
 * Test organization:
 * - T1.x: createGateway - Test per la funzione di creazione gateway
 *   - T1.1: create gateway - Test di creazione base
 *   - T1.2: create gateway: conflict - Test di conflitto (duplicato)
 *
 * - T2.x: getGatewayByMacAddress - Test per la funzione di ricerca gateway
 *   - T2.1: find gateway by macAddress - Test con MAC address esistente
 *   - T2.2: find gateway by macAddress: not found - Test con MAC address non esistente
 *
 * - T3.x: deleteGateway - Test per la funzione di eliminazione gateway
 *   - T3.1: delete gateway - Test di eliminazione con successo
 *   - T3.2: delete gateway: not found - Test di eliminazione gateway non esistente
 *
 * - T4.x: updateGateway - Test per la funzione di aggiornamento gateway
 *   - T4.1: update gateway - Test di aggiornamento base
 *   - T4.2: update gateway with different macAddress - Test di cambio MAC address
 *   - T4.3: update gateway with different macAddress conflict - Test di conflitto con MAC esistente
 *   - T4.4: update gateway: not found - Test con gateway non esistente
 *
 * - T5.x: getAllGateways - Test per la funzione di recupero di tutti i gateway
 *   - T5.1: get all gateways - Test con gateway presenti
 *   - T5.2: get all gateways: empty - Test senza gateway presenti
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

import { GatewayRepository } from "@repositories/GatewayRepository";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("GatewayRepository: mocked database", () => {
  const repo = new GatewayRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("T1.1: create gateway", async () => {
    mockFind.mockResolvedValue([]);

    const savedGateway = new GatewayDAO();
    savedGateway.macAddress = "94:3F:BE:4C:4A:79";
    savedGateway.name = "Gateway1";
    savedGateway.description = "Test gateway";
    savedGateway.network = new NetworkDAO();

    mockSave.mockResolvedValue(savedGateway);

    const result = await repo.createGateway(
      "94:3F:BE:4C:4A:79",
      "Gateway1",
      "Test gateway",
      savedGateway.network
    );

    expect(result).toBeInstanceOf(GatewayDAO);
    expect(result).toBe(savedGateway);
    expect(mockSave).toHaveBeenCalled();
  });

  it("T1.2: create gateway: conflict", async () => {
    const existingGateway = new GatewayDAO();
    existingGateway.macAddress = "94:3F:BE:4C:4A:79";

    mockFind.mockResolvedValue([existingGateway]);

    await expect(
      repo.createGateway(
        "94:3F:BE:4C:4A:79",
        "Another",
        "Desc",
        new NetworkDAO()
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T2.1: find gateway by macAddress", async () => {
    const found = new GatewayDAO();
    found.macAddress = "94:3F:BE:4C:4A:79";

    mockFind.mockResolvedValue([found]);

    const result = await repo.getGatewayByMacAddress("94:3F:BE:4C:4A:79");
    expect(result).toBe(found);
    expect(result.macAddress).toBe("94:3F:BE:4C:4A:79");
  });

  it("T2.2: find gateway by macAddress: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(
      repo.getGatewayByMacAddress("00:00:00:00:00:00")
    ).rejects.toThrow(NotFoundError);
  });

  it("T3.1: delete gateway", async () => {
    const gateway = new GatewayDAO();

    gateway.macAddress = "AA:BB:CC:DD:EE:FF";

    mockFind.mockResolvedValue([gateway]);

    await repo.deleteGateway("AA:BB:CC:DD:EE:FF");

    expect(mockRemove).toHaveBeenCalledWith(gateway);
  });

  it("T3.2: delete gateway: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.deleteGateway("00:00:00:00:00:00")).rejects.toThrow(
      NotFoundError
    );
  });  it("T4.1: update gateway", async () => {
    const oldGateway = new GatewayDAO();
    oldGateway.macAddress = "AA:BB:CC:DD:EE:FF";
    oldGateway.name = "OldName";
    oldGateway.description = "OldDescription";

    const updatedGateway = new GatewayDAO();
    updatedGateway.macAddress = "AA:BB:CC:DD:EE:FF";
    updatedGateway.name = "NewName";
    updatedGateway.description = "NewDescription";

    mockFind
      .mockResolvedValueOnce([oldGateway])
      .mockResolvedValueOnce([updatedGateway]);

    mockUpdate.mockResolvedValueOnce({ affected: 1 });

    const result = await repo.updateGateway(
      "AA:BB:CC:DD:EE:FF",
      "AA:BB:CC:DD:EE:FF",
      "NewName",
      "NewDescription"
    );

    expect(result).toBe(updatedGateway);
  });  it("T4.2: update gateway with different macAddress", async () => {
    const oldGateway = new GatewayDAO();
    oldGateway.macAddress = "AA:BB:CC:DD:EE:FF";
    oldGateway.name = "OldName";
    oldGateway.description = "OldDescription";

    const updatedGateway = new GatewayDAO();
    updatedGateway.macAddress = "BB:CC:DD:EE:FF:00";
    updatedGateway.name = "NewName";
    updatedGateway.description = "NewDescription";

    mockFind
      .mockResolvedValueOnce([oldGateway])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([updatedGateway]);

    mockUpdate.mockResolvedValueOnce({ affected: 1 });

    const result = await repo.updateGateway(
      "AA:BB:CC:DD:EE:FF",
      "BB:CC:DD:EE:FF:00",
      "NewName",
      "NewDescription"
    );

    expect(result).toBe(updatedGateway);
  });  it("T4.3: update gateway with different macAddress conflict", async () => {
    const oldGateway = new GatewayDAO();
    oldGateway.macAddress = "AA:BB:CC:DD:EE:FF";
    oldGateway.name = "OldName";
    oldGateway.description = "OldDescription";

    const existingGateway = new GatewayDAO();
    existingGateway.macAddress = "BB:CC:DD:EE:FF:00";

    mockFind
      .mockResolvedValueOnce([oldGateway])
      .mockResolvedValueOnce([existingGateway]);

    await expect(
      repo.updateGateway(
        "AA:BB:CC:DD:EE:FF",
        "BB:CC:DD:EE:FF:00",
        "NewName",
        "NewDescription"
      )
    ).rejects.toThrow(ConflictError);
  });
  it("T4.4: update gateway: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(
      repo.updateGateway(
        "00:00:00:00:00:00",
        "11:22:33:44:55:66",
        "NewName",
        "NewDescription"
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("T5.1: get all gateways", async () => {
    const gateway1 = new GatewayDAO();
    gateway1.macAddress = "AA:BB:CC:DD:EE:FF";
    const gateway2 = new GatewayDAO();
    gateway2.macAddress = "11:22:33:44:55:66";

    mockFind.mockResolvedValue([gateway1, gateway2]);

    const result = await repo.getAllGateways();

    expect(result).toEqual([gateway1, gateway2]);
  });

  it("T5.2: get all gateways: empty", async () => {
    mockFind.mockResolvedValue([]);

    const result = await repo.getAllGateways();

    expect(result).toEqual([]);
  });
});
