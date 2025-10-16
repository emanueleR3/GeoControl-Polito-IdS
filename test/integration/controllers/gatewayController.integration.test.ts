import * as gatewayController from "@controllers/gatewayController";
import { GatewayDAO } from "@dao/GatewayDAO";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

/**
 * Gateway Controller Integration Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Controller function being tested (1=getGateway, 2=getAllGateways, 3=createGateway, 4=updateGateway, 5=deleteGateway)
 * - y: Test number for that function
 *
 * Test Structure:
 * T1.1: getGateway - tests successful gateway retrieval with mapper service integration
 * T1.2: getGateway: not found - tests NotFoundError handling with mapper service
 * T2.1: getAllGateways - tests successful gateways retrieval with mapper service integration
 * T2.2: getAllGateways: empty - tests empty list handling with mapper service
 * T3.1: createGateway - tests successful gateway creation with mapper service integration
 * T3.2: createGateway: conflict - tests ConflictError handling for existing MAC address
 * T4.1: updateGateway - tests successful gateway update with mapper service integration
 * T4.2: updateGateway: conflict - tests ConflictError handling for existing MAC address
 * T5.1: deleteGateway - tests successful gateway deletion with mapper service integration
 * T5.2: deleteGateway: not found - tests NotFoundError handling with mapper service
 */

jest.mock("@repositories/GatewayRepository");
jest.mock("@repositories/NetworkRepository", () => {
  return {
    NetworkRepository: jest.fn().mockImplementation(() => ({
      getNetworkByCode: jest
        .fn()
        .mockResolvedValue({ code: "NET01", name: "Test Network" }),
    })),
  };
});

describe("GatewayController integration", () => {
  it("T1.1: get Gateway: mapperService integration", async () => {
    const fakeGatewayDAO: GatewayDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Gateway",
      description: "This is a test gateway",
      sensors: [],
      measurements: [],
      network: null,
    };

    const expectedDTO = {
      macAddress: fakeGatewayDAO.macAddress,
      name: fakeGatewayDAO.name,
      description: fakeGatewayDAO.description,
      sensors: [],
      measurements: [],
      network: null,
    };

    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getGatewayByMacAddress: jest.fn().mockResolvedValue(fakeGatewayDAO),
    }));

    const result = await gatewayController.getGateway("00:00:00:00:00:01");

    expect(result).toEqual({
      macAddress: expectedDTO.macAddress,
      name: expectedDTO.name,
      description: expectedDTO.description,
    });
    expect(result).not.toHaveProperty("sensors");
    expect(result).not.toHaveProperty("measurements");
    expect(result).not.toHaveProperty("network");
  });

  it("T1.2: get Gateway: mapperService integration with not found error", async () => {
    const fakeMacAddress = "00:00:00:00:00:01";

    const getGatewayMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(
        `Gateway with mac address '${fakeMacAddress}' not found`
      );
    });
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getGatewayByMacAddress: getGatewayMock,
    }));

    await expect(gatewayController.getGateway(fakeMacAddress)).rejects.toThrow(
      NotFoundError
    );
  });

  it("T2.1: get All Gateways: mapperService integration", async () => {
    const fakeNetwork = {
      code: "NET01",
      name: "Test Network",
      description: "This is a test network",
      gateways: [],
    };

    const fakeGatewayDAOs: GatewayDAO[] = [
      {
        macAddress: "00:00:00:00:00:01",
        name: "Test Gateway 1",
        description: "This is a test gateway 1",
        sensors: [],
        measurements: [],
        network: fakeNetwork,
      },
      {
        macAddress: "00:00:00:00:00:02",
        name: "Test Gateway 2",
        description: "This is a test gateway 2",
        sensors: [],
        measurements: [],
        network: fakeNetwork,
      },
    ];

    const expectedDTOs = fakeGatewayDAOs.map((gateway) => ({
      macAddress: gateway.macAddress,
      name: gateway.name,
      description: gateway.description,
      network: fakeNetwork,
    }));

    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getAllGatewaysByNetworkCode: jest.fn().mockResolvedValue(fakeGatewayDAOs),
    }));

    const result = await gatewayController.getAllGateways(fakeNetwork.code);

    expect(result).toEqual(expectedDTOs);
  });

  it("T2.2: get All Gateways: mapperService integration with empty list", async () => {
    let networkCode = "NET11";

    const fakeGatewayDAOs: GatewayDAO[] = [];

    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      getAllGatewaysByNetworkCode: jest.fn().mockResolvedValue(fakeGatewayDAOs),
    }));

    const result = await gatewayController.getAllGateways(networkCode);

    expect(result).toEqual([]);
  });

  it("T3.1: create Gateway: mapperService integration", async () => {
    const fakeGatewayDAO: GatewayDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Gateway",
      description: "This is a test gateway",
      sensors: [],
      measurements: [],
      network: null,
    };

    const expectedDTO = {
      macAddress: fakeGatewayDAO.macAddress,
      name: fakeGatewayDAO.name,
      description: fakeGatewayDAO.description,
      sensors: [],
      measurements: [],
      network: null,
    };

    const createGatewayMock = jest.fn().mockResolvedValue(fakeGatewayDAO);
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      createGateway: createGatewayMock,
    }));

    const result = await gatewayController.createGateway("NET01", expectedDTO);

    expect(createGatewayMock).toHaveBeenCalledWith(
      expectedDTO.macAddress,
      expectedDTO.name,
      expectedDTO.description,
      { code: "NET01", name: "Test Network" }
    );
  });

  it("T3.2: create Gateway: mapperService integration with existing mac address", async () => {
    const fakeGatewayDAO: GatewayDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Gateway",
      description: "This is a test gateway",
      sensors: [],
      measurements: [],
      network: null,
    };

    const createGatewayMock = jest.fn().mockImplementation(() => {
      throw new ConflictError(
        `Gateway with MAC address '${fakeGatewayDAO.macAddress}' already exists`
      );
    });
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      createGateway: createGatewayMock,
    }));

    await expect(
      gatewayController.createGateway("NET01", fakeGatewayDAO)
    ).rejects.toThrow(ConflictError);
  });

  it("T4.1: update Gateway: mapperService integration", async () => {
    const fakeGatewayDAO: GatewayDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Gateway",
      description: "This is a test gateway",
      sensors: [],
      measurements: [],
      network: null,
    };

    const expectedDTO = {
      macAddress: fakeGatewayDAO.macAddress,
      name: fakeGatewayDAO.name,
      description: fakeGatewayDAO.description,
      sensors: [],
      measurements: [],
      network: null,
    };

    const updateGatewayMock = jest.fn().mockResolvedValue(fakeGatewayDAO);
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      updateGateway: updateGatewayMock,
    }));

    await gatewayController.updateGateway("00:00:00:00:00:01", expectedDTO);

    expect(updateGatewayMock).toHaveBeenCalledWith(
      "00:00:00:00:00:01",
      expectedDTO.macAddress,
      expectedDTO.name,
      expectedDTO.description
    );
  });

  it("T4.2: update Gateway: mapperService integration with existing mac address", async () => {
    const fakeGatewayDAO: GatewayDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Gateway",
      description: "This is a test gateway",
      sensors: [],
      measurements: [],
      network: null,
    };

    const updateGatewayMock = jest.fn().mockImplementation(() => {
      throw new ConflictError(
        `Gateway with MAC address '${fakeGatewayDAO.macAddress}' already exists`
      );
    });
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      updateGateway: updateGatewayMock,
    }));

    await expect(
      gatewayController.updateGateway("00:00:00:00:00:01", fakeGatewayDAO)
    ).rejects.toThrow(ConflictError);
  });

  it("T5.1: delete Gateway: mapperService integration", async () => {
    const fakeGatewayDAO: GatewayDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Gateway",
      description: "This is a test gateway",
      sensors: [],
      measurements: [],
      network: null,
    };

    const deleteGatewayMock = jest.fn().mockResolvedValue(fakeGatewayDAO);
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      deleteGateway: deleteGatewayMock,
    }));

    await gatewayController.deleteGateway("00:00:00:00:00:01");

    expect(deleteGatewayMock).toHaveBeenCalledWith("00:00:00:00:00:01");
  });

  it("T5.2: delete Gateway: mapperService integration with not found error", async () => {
    const fakeMacAddress = "00:00:00:00:00:01";

    const deleteGatewayMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(
        `Gateway with MAC address '${fakeMacAddress}' not found`
      );
    });
    (GatewayRepository as jest.Mock).mockImplementation(() => ({
      deleteGateway: deleteGatewayMock,
    }));

    await expect(
      gatewayController.deleteGateway(fakeMacAddress)
    ).rejects.toThrow(NotFoundError);
  });
});
