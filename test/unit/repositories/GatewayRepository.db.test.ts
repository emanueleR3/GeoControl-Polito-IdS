/**
 * Test naming convention: Tx.y where x represents the function being tested and y represents the nth test for that same function
 *
 * Test organization:
 * - T1.x: createGateway - Test per la funzione di creazione gateway
 *   - T1.1: createGateway - Test di creazione base
 *   - T1.2: createGateway - Test di conflitto (duplicato)
 *
 * - T2.x: getGatewayByMacAddress - Test per la funzione di ricerca gateway
 *   - T2.1: getGatewayByMacAddress - Test con MAC address non esistente
 *   - T2.2: getGatewayByMacAddress - Test con MAC address esistente
 *
 * - T3.x: deleteGateway - Test per la funzione di eliminazione gateway
 *   - T3.1: deleteGateway - Test di eliminazione con successo
 *   - T3.2: deleteGateway - Test di eliminazione gateway non esistente
 *
 * - T4.x: updateGateway - Test per la funzione di aggiornamento gateway
 *   - T4.1: updateGateway - Test di aggiornamento base
 *   - T4.2: updateGateway - Test di cambio MAC address
 *   - T4.3: updateGateway - Test di conflitto con MAC esistente
 *   - T4.4: updateGateway not found - Test con gateway non esistente
 *
 * - T5.x: get all gateways - Test per la funzione di recupero di tutti i gateway
 *   - T5.1: get all gateways - Test con gateway presenti
 *   - T5.2: get all gateways: none - Test senza gateway presenti
 */

import { GatewayRepository } from "@repositories/GatewayRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource,
} from "@test/setup/test-datasource";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("GatewayRepository: SQLite in-memory", () => {
  const repo = new GatewayRepository();
  it("T1.1: createGateway", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = await repo.createGateway(
      "94:3F:BE:4C:4A:79",
      "Gateway1",
      "Test gateway",
      network
    );
    expect(gateway).toMatchObject({
      macAddress: "94:3F:BE:4C:4A:79",
      name: "Gateway1",
      description: "Test gateway",
      network: network,
    });

    const found = await repo.getGatewayByMacAddress("94:3F:BE:4C:4A:79");
    expect(found.macAddress).toBe("94:3F:BE:4C:4A:79");
  });

  it("T2.1: getGatewayByMacAddress", async () => {
    await expect(
      repo.getGatewayByMacAddress("00:00:00:00:00:00")
    ).rejects.toThrow(NotFoundError);
  });

  it("T2.2: getGatewayByMacAddress", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.createGateway(
      "94:3F:BE:4C:4A:79",
      "Gateway1",
      "Test gateway",
      network
    );
    const found = await repo.getGatewayByMacAddress("94:3F:BE:4C:4A:79");
    expect(found).toMatchObject({
      macAddress: "94:3F:BE:4C:4A:79",
      name: "Gateway1",
      description: "Test gateway",
    });
  });

  it("T1.2: createGateway", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.createGateway(
      "94:3F:BE:4C:4A:79",
      "Gateway1",
      "Test gateway",
      network
    );
    await expect(
      repo.createGateway(
        "94:3F:BE:4C:4A:79",
        "Gateway2",
        "Test gateway 2",
        network
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T3.1: deleteGateway", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.createGateway(
      "AA:BB:CC:DD:EE:FF",
      "ToDelete",
      "Temporary",
      network
    );

    await repo.deleteGateway("AA:BB:CC:DD:EE:FF");
    await expect(
      repo.getGatewayByMacAddress("AA:BB:CC:DD:EE:FF")
    ).rejects.toThrow(NotFoundError);
  });

  it("T3.2: deleteGateway", async () => {
    await expect(repo.deleteGateway("00:00:00:00:00:00")).rejects.toThrow(
      NotFoundError
    );
  });

  it("T4.1: updateGateway", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.createGateway(
      "AA:BB:CC:DD:EE:FF",
      "OldName",
      "OldDescription",
      network
    );

    const updatedGateway = await repo.updateGateway(
      "AA:BB:CC:DD:EE:FF",
      "AA:BB:CC:DD:EE:FF",
      "NewName",
      "NewDescription"
    );
    expect(updatedGateway.name).toBe("NewName");
    expect(updatedGateway.description).toBe("NewDescription");
  });

  it("T4.2: updateGateway", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.createGateway(
      "AA:BB:CC:DD:EE:FF",
      "OldName",
      "OldDescription",
      network
    );

    const updatedGateway = await repo.updateGateway(
      "AA:BB:CC:DD:EE:FF",
      "11:22:33:44:55:66",
      "NewName",
      "NewDescription"
    );

    expect(updatedGateway.macAddress).toBe("11:22:33:44:55:66");
  });

  it("T4.3: updateGateway", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.createGateway(
      "AA:BB:CC:DD:EE:FF",
      "OldName",
      "OldDescription",
      network
    );
    await repo.createGateway(
      "11:22:33:44:55:66",
      "Another",
      "Another description",
      network
    );

    await expect(
      repo.updateGateway(
        "AA:BB:CC:DD:EE:FF",
        "11:22:33:44:55:66",
        "NewName",
        "NewDescription"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T4.4: updateGateway not found", async () => {
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
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.createGateway(
      "AA:BB:CC:DD:EE:FF",
      "Gateway1",
      "Description1",
      network
    );
    await repo.createGateway(
      "11:22:33:44:55:66",
      "Gateway2",
      "Description2",
      network
    );

    const gateways = await repo.getAllGateways();
    expect(gateways.length).toBe(2);
    expect(gateways[0].macAddress).toBe("AA:BB:CC:DD:EE:FF");
    expect(gateways[1].macAddress).toBe("11:22:33:44:55:66");
  });

  it("T5.2: get all gateways: none", async () => {
    const gateways = await repo.getAllGateways();
    expect(gateways.length).toBe(0);
  });
});
