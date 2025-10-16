/**
 * Test naming convention: Tx.y where x represents the function being tested and y represents the nth test for that same function
 *
 * Test organization:
 * - T1.x: getAllNetworks - Test per la funzione di recupero di tutti i network
 *   - T1.1: get all networks - Test con network presenti
 *
 * - T2.x: createNetwork - Test per la funzione di creazione network
 *   - T2.1: create network - Test di creazione base
 *   - T2.2: create network: conflict - Test di conflitto (duplicato)
 *
 * - T3.x: getNetworkByCode - Test per la funzione di ricerca network
 *   - T3.1: get network by code - Test con codice esistente
 *   - T3.2: get network by code: not found - Test con codice non esistente
 *
 * - T4.x: updateNetwork - Test per la funzione di aggiornamento network
 *   - T4.1: update network - Test di aggiornamento base
 *   - T4.2: update network: not found - Test con network non esistente
 *   - T4.3: update network: conflict - Test di conflitto con codice esistente
 *
 * - T5.x: deleteNetwork - Test per la funzione di eliminazione network
 *   - T5.1: delete network - Test di eliminazione con successo
 *   - T5.2: delete network: not found - Test di eliminazione network non esistente
 */

import { NetworkRepository } from "@repositories/NetworkRepository";
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
  await TestDataSource.getRepository(NetworkDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
});

describe("NetworkRepository: SQLite in-memory", () => {
  const repo = new NetworkRepository();
  it("T1.1: get all networks", async () => {
    const network1 = new NetworkDAO();
    network1.code = "NET01";
    network1.name = "Test Network 1";
    network1.description = "Test network description 1";
    await TestDataSource.getRepository(NetworkDAO).save(network1);

    const network2 = new NetworkDAO();
    network2.code = "NET02";
    network2.name = "Test Network 2";
    network2.description = "Test network description 2";
    await TestDataSource.getRepository(NetworkDAO).save(network2);

    const networks = await repo.getAllNetworks();
    expect(networks.length).toBe(2);
  });

  it("T2.1: create network", async () => {
    const network = await repo.createNetwork(
      "NET01",
      "Test Network",
      "Test network description"
    );
    expect(network).toMatchObject({
      code: "NET01",
      name: "Test Network",
      description: "Test network description",
    });

    const found = await repo.getNetworkByCode("NET01");
    expect(found.code).toBe("NET01");
  });

  it("T2.2: create network: conflict", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await expect(
      repo.createNetwork("NET01", "Another Network", "Another description")
    ).rejects.toThrow(ConflictError);
  });

  it("T3.2: get network by code: not found", async () => {
    await expect(repo.getNetworkByCode("NET01")).rejects.toThrow(NotFoundError);
  });

  it("T3.1: get network by code", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const found = await repo.getNetworkByCode("NET01");
    expect(found.code).toBe("NET01");
  });

  it("T4.1: update network", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const updatedNetwork = await repo.updateNetwork(
      "NET01",
      "NET02",
      "Updated Network",
      "Updated description"
    );
    expect(updatedNetwork).toMatchObject({
      code: "NET02",
      name: "Updated Network",
      description: "Updated description",
    });

    const found = await repo.getNetworkByCode("NET02");
    expect(found.code).toBe("NET02");
  });

  it("T4.2: update network: not found", async () => {
    await expect(
      repo.updateNetwork(
        "NET01",
        "NET02",
        "Updated Network",
        "Updated description"
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("T4.3: update network: conflict", async () => {
    const network1 = new NetworkDAO();
    network1.code = "NET01";
    network1.name = "Test Network 1";
    network1.description = "Test network description 1";
    await TestDataSource.getRepository(NetworkDAO).save(network1);

    const network2 = new NetworkDAO();
    network2.code = "NET02";
    network2.name = "Test Network 2";
    network2.description = "Test network description 2";
    await TestDataSource.getRepository(NetworkDAO).save(network2);

    await expect(
      repo.updateNetwork(
        "NET01",
        "NET02",
        "Updated Network",
        "Updated description"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T5.1: delete network", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    await repo.deleteNetwork("NET01");

    await expect(repo.getNetworkByCode("NET01")).rejects.toThrow(NotFoundError);
  });

  it("delete network: not found", async () => {
    await expect(repo.deleteNetwork("NET01")).rejects.toThrow(NotFoundError);
  });
});
