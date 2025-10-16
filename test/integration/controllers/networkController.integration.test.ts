/**
 * NetworkController Integration Tests
 *
 * Test Naming Convention: Tx.y
 * - T = Test
 * - x = Function/endpoint group number
 * - y = Test number within that group
 *
 * Function Groups:
 * - T1: getNetwork - Get single network by code with mapper service integration
 * - T2: getAllNetworks - Get all networks with mapper service integration
 * - T3: createNetwork - Create new network with mapper service integration
 * - T4: updateNetwork - Update existing network with mapper service integration
 * - T5: deleteNetwork - Delete network with mapper service integration
 *
 * Test Structure:
 * T1.1: Get network - successful mapper service integration
 * T1.2: Get network - mapper service integration with not found error
 * T2.1: Get all networks - successful mapper service integration
 * T2.2: Get all networks - mapper service integration with empty list
 * T3.1: Create network - successful mapper service integration
 * T3.2: Create network - mapper service integration with existing code conflict
 * T4.1: Update network - successful mapper service integration
 * T4.2: Update network - mapper service integration with existing code conflict
 * T5.1: Delete network - successful mapper service integration
 * T5.2: Delete network - mapper service integration with not found error
 */

// filepath: c:\Users\eriks\OneDrive - Politecnico di Torino\Magistrale\A.A. 24-25\Software Engeneering\geocontrol\test\integration\controllers\networkController.integration.test.ts
import * as networkController from "@controllers/networkController";
import { NetworkDAO } from "@dao/NetworkDAO";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@repositories/NetworkRepository");

describe("NetworkController integration", () => {
  it("T1.1: get Network: mapperService integration", async () => {
    const fakeNetworkDAO: NetworkDAO = {
      code: "NET01",
      name: "Test Network",
      description: "This is a test network",
      gateways: [],
    };

    const expectedDTO = {
      code: fakeNetworkDAO.code,
      name: fakeNetworkDAO.name,
      description: fakeNetworkDAO.description,
    };

    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByCode: jest.fn().mockResolvedValue(fakeNetworkDAO),
    }));

    const result = await networkController.getNetwork("NET01");

    expect(result).toEqual({
      code: expectedDTO.code,
      name: expectedDTO.name,
      description: expectedDTO.description,
    });
    expect(result).not.toHaveProperty("gateways");
  });

  it("T1.2: get Network: mapperService integration with not found error", async () => {
    const fakeNetworkCode = "NET01";

    const getNetworkMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(
        `Network with code '${fakeNetworkCode}' not found`
      );
    });
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByCode: getNetworkMock,
    }));

    await expect(networkController.getNetwork(fakeNetworkCode)).rejects.toThrow(
      NotFoundError
    );
  });

  it("T2.1: get All Networks: mapperService integration", async () => {
    const fakeNetworkDAOs: NetworkDAO[] = [
      {
        code: "NET01",
        name: "Test Network 1",
        description: "This is a test network 1",
        gateways: [],
      },
      {
        code: "NET02",
        name: "Test Network 2",
        description: "This is a test network 2",
        gateways: [],
      },
    ];

    const expectedDTOs = fakeNetworkDAOs.map((network) => ({
      code: network.code,
      name: network.name,
      description: network.description,
    }));

    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getAllNetworks: jest.fn().mockResolvedValue(fakeNetworkDAOs),
    }));

    const result = await networkController.getAllNetworks();

    expect(result).toEqual(expectedDTOs);
  });

  it("T2.2: get All Networks: mapperService integration with empty list", async () => {
    const fakeNetworkDAOs: NetworkDAO[] = [];

    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getAllNetworks: jest.fn().mockResolvedValue(fakeNetworkDAOs),
    }));

    const result = await networkController.getAllNetworks();

    expect(result).toEqual([]);
  });

  it("T3.1: create Network: mapperService integration", async () => {
    const fakeNetworkDTO = {
      code: "NET01",
      name: "Test Network",
      description: "This is a test network",
    };

    const createNetworkMock = jest.fn().mockResolvedValue(fakeNetworkDTO);
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      createNetwork: createNetworkMock,
    }));

    await networkController.createNetwork(fakeNetworkDTO);

    expect(createNetworkMock).toHaveBeenCalledWith(
      fakeNetworkDTO.code,
      fakeNetworkDTO.name,
      fakeNetworkDTO.description
    );
  });

  it("T3.2: create Network: mapperService integration with existing code", async () => {
    const fakeNetworkDTO = {
      code: "NET01",
      name: "Test Network",
      description: "This is a test network",
    };

    const createNetworkMock = jest.fn().mockImplementation(() => {
      throw new ConflictError(
        `Network with code '${fakeNetworkDTO.code}' already exists`
      );
    });
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      createNetwork: createNetworkMock,
    }));

    await expect(
      networkController.createNetwork(fakeNetworkDTO)
    ).rejects.toThrow(ConflictError);
  });

  it("T4.1: update Network: mapperService integration", async () => {
    const fakeNetworkDTO = {
      code: "NET01",
      name: "Updated Network",
      description: "This is an updated test network",
    };

    const updateNetworkMock = jest.fn().mockResolvedValue(fakeNetworkDTO);
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      updateNetwork: updateNetworkMock,
    }));

    await networkController.updateNetwork("NET01", fakeNetworkDTO);

    expect(updateNetworkMock).toHaveBeenCalledWith(
      "NET01",
      fakeNetworkDTO.code,
      fakeNetworkDTO.name,
      fakeNetworkDTO.description
    );
  });

  it("T4.2: update Network: mapperService integration with existing code", async () => {
    const fakeNetworkDTO = {
      code: "NET01",
      name: "Updated Network",
      description: "This is an updated test network",
    };

    const updateNetworkMock = jest.fn().mockImplementation(() => {
      throw new ConflictError(
        `Network with code '${fakeNetworkDTO.code}' already exists`
      );
    });
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      updateNetwork: updateNetworkMock,
    }));

    await expect(
      networkController.updateNetwork("NET01", fakeNetworkDTO)
    ).rejects.toThrow(ConflictError);
  });

  it("T5.1: delete Network: mapperService integration", async () => {
    const fakeNetworkCode = "NET01";

    const deleteNetworkMock = jest.fn().mockResolvedValue(undefined);
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      deleteNetwork: deleteNetworkMock,
    }));

    await networkController.deleteNetwork(fakeNetworkCode);

    expect(deleteNetworkMock).toHaveBeenCalledWith(fakeNetworkCode);
  });

  it("T5.2: delete Network: mapperService integration with not found error", async () => {
    const fakeNetworkCode = "NET01";

    const deleteNetworkMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(
        `Network with code '${fakeNetworkCode}' not found`
      );
    });
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      deleteNetwork: deleteNetworkMock,
    }));

    await expect(
      networkController.deleteNetwork(fakeNetworkCode)
    ).rejects.toThrow(NotFoundError);
  });
});
