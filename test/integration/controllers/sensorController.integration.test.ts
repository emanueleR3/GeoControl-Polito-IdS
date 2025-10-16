/**
 * SensorController Integration Tests
 *
 * Test Naming Convention: Tx.y
 * - T = Test
 * - x = Function/endpoint group number
 * - y = Test number within that group
 *
 * Function Groups:
 * - T1: getSensor - Get single sensor by MAC address with mapper service integration
 * - T2: getAllSensors - Get all sensors by gateway with mapper service integration
 * - T3: createSensor - Create new sensor with mapper service integration
 * - T4: updateSensor - Update existing sensor with mapper service integration
 * - T5: deleteSensor - Delete sensor with mapper service integration
 *
 * Test Structure:
 * T1.1: Get sensor - successful mapper service integration
 * T1.2: Get sensor - mapper service integration with not found error
 * T2.1: Get all sensors - successful mapper service integration
 * T2.2: Get all sensors - mapper service integration with empty list
 * T3.1: Create sensor - successful mapper service integration
 * T3.2: Create sensor - mapper service integration with existing MAC address conflict
 * T4.1: Update sensor - successful mapper service integration
 * T4.2: Update sensor - mapper service integration with existing MAC address conflict
 * T5.1: Delete sensor - successful mapper service integration
 * T5.2: Delete sensor - mapper service integration with not found error
 */

// filepath: c:\Users\eriks\OneDrive - Politecnico di Torino\Magistrale\A.A. 24-25\Software Engeneering\geocontrol\test\integration\controllers\sensorController.integration.test.ts
import * as sensorController from "@controllers/sensorController";
import { SensorDAO } from "@dao/SensorDAO";
import { SensorRepository } from "@repositories/SensorRepository";
import * as GatewayRepository from "@repositories/GatewayRepository";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@repositories/SensorRepository");
jest.mock("@repositories/GatewayRepository", () => ({
  GatewayRepository: jest.fn().mockImplementation(() => ({
    getGatewayByMacAddress: jest.fn().mockResolvedValue(null),
  })),
}));

describe("SensorController integration", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("T1.1: get Sensor: mapperService integration", async () => {
    const fakeSensorDAO: SensorDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Sensor",
      description: "This is a test sensor",
      variable: "Temperature",
      unit: "Celsius",
      gateway: null,
      measurements: [],
    };

    const expectedDTO = {
      macAddress: fakeSensorDAO.macAddress,
      name: fakeSensorDAO.name,
      description: fakeSensorDAO.description,
      variable: fakeSensorDAO.variable,
      unit: fakeSensorDAO.unit,
      gateway: null,
      measurements: [],
    };

    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorByMacAddress: jest.fn().mockResolvedValue(fakeSensorDAO),
    }));

    const result = await sensorController.getSensor("00:00:00:00:00:01");

    expect(result).toEqual({
      macAddress: expectedDTO.macAddress,
      name: expectedDTO.name,
      description: expectedDTO.description,
      variable: expectedDTO.variable,
      unit: expectedDTO.unit,
    });
    expect(result).not.toHaveProperty("gateway");
    expect(result).not.toHaveProperty("measurements");
  });

  it("T1.2: get Sensor: mapperService integration with not found error", async () => {
    const fakeMacAddress = "00:00:00:00:00:01";

    const getSensorMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(
        `Sensor with MAC address '${fakeMacAddress}' not found`
      );
    });
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorByMacAddress: getSensorMock,
    }));

    await expect(sensorController.getSensor(fakeMacAddress)).rejects.toThrow(
      NotFoundError
    );
  });

  it("T2.1: get All Sensors: mapperService integration", async () => {
    const fakeGateway = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Test Gateway",
      description: "This is a test gateway",
      location: "Lab",
      sensors: [],
      measurements: [],
      network: null,
    };

    const fakeSensorDAOs: SensorDAO[] = [
      {
        macAddress: "00:00:00:00:00:01",
        name: "Test Sensor 1",
        description: "This is a test sensor 1",
        variable: "Temperature",
        unit: "Celsius",
        gateway: fakeGateway,
        measurements: [],
      },
      {
        macAddress: "00:00:00:00:00:02",
        name: "Test Sensor 2",
        description: "This is a test sensor 2",
        variable: "Humidity",
        unit: "Percentage",
        gateway: fakeGateway,
        measurements: [],
      },
    ];

    const expectedDTOs = fakeSensorDAOs.map((sensor) => ({
      macAddress: sensor.macAddress,
      name: sensor.name,
      description: sensor.description,
      variable: sensor.variable,
      unit: sensor.unit,
    }));

    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorsByGateway: jest.fn().mockResolvedValue(fakeSensorDAOs),
    }));

    (GatewayRepository.GatewayRepository as jest.Mock).mockImplementation(
      () => ({
        getGatewayByMacAddress: jest.fn().mockResolvedValue(fakeGateway),
      })
    );

    const result = await sensorController.getAllSensors(fakeGateway.macAddress);

    expect(result).toEqual(expectedDTOs);
  });

  it("T2.2: get All Sensors: mapperService integration with empty list", async () => {
    let macAddress: "AA:BB:CC:DD:EE:FF";

    const fakeSensorDAOs: SensorDAO[] = [];

    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorsByGateway: jest.fn().mockResolvedValue(fakeSensorDAOs),
    }));

    const result = await sensorController.getAllSensors(macAddress);

    expect(result).toEqual([]);
  });

  it("T3.1: create Sensor: mapperService integration", async () => {
    const fakeGateway = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Test Gateway",
      description: "This is a test gateway",
      location: "Lab",
      sensors: [],
      measurements: [],
      network: null,
    };

    const fakeSensorDAO: SensorDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Sensor",
      description: "This is a test sensor",
      variable: "Temperature",
      unit: "Celsius",
      gateway: fakeGateway,
      measurements: [],
    };

    const createSensorMock = jest.fn().mockResolvedValue(fakeSensorDAO);
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      createSensor: createSensorMock,
    }));

    await sensorController.createSensor(fakeGateway.macAddress, fakeSensorDAO);

    expect(createSensorMock).toHaveBeenCalledWith(
      fakeSensorDAO.macAddress,
      fakeSensorDAO.name,
      fakeSensorDAO.description,
      fakeSensorDAO.variable,
      fakeSensorDAO.unit,
      fakeGateway
    );
  });

  it("T3.2: create Sensor: mapperService integration with existing mac address", async () => {
    const fakeSensorDAO: SensorDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Sensor",
      description: "This is a test sensor",
      variable: "Temperature",
      unit: "Celsius",
      gateway: null,
      measurements: [],
    };

    const createSensorMock = jest.fn().mockImplementation(() => {
      throw new ConflictError(
        `Sensor with MAC address '${fakeSensorDAO.macAddress}' already exists`
      );
    });
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      createSensor: createSensorMock,
    }));

    await expect(
      sensorController.createSensor(fakeSensorDAO.macAddress, fakeSensorDAO)
    ).rejects.toThrow(ConflictError);
  });

  it("T4.1: update Sensor: mapperService integration", async () => {
    const fakeSensorDAO: SensorDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Sensor",
      description: "This is a test sensor",
      variable: "Temperature",
      unit: "Celsius",
      gateway: null,
      measurements: [],
    };

    const updateSensorMock = jest.fn().mockResolvedValue(fakeSensorDAO);
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      updateSensor: updateSensorMock,
    }));

    await sensorController.updateSensor("00:00:00:00:00:01", fakeSensorDAO);

    expect(updateSensorMock).toHaveBeenCalledWith(
      "00:00:00:00:00:01",
      fakeSensorDAO.macAddress,
      fakeSensorDAO.name,
      fakeSensorDAO.description,
      fakeSensorDAO.variable,
      fakeSensorDAO.unit
    );
  });

  it("T4.2: update Sensor: mapperService integration with existing mac address", async () => {
    const fakeSensorDAO: SensorDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Sensor",
      description: "This is a test sensor",
      variable: "Temperature",
      unit: "Celsius",
      gateway: null,
      measurements: [],
    };

    const updateSensorMock = jest.fn().mockImplementation(() => {
      throw new ConflictError(
        `Sensor with MAC address '${fakeSensorDAO.macAddress}' already exists`
      );
    });
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      updateSensor: updateSensorMock,
    }));

    await expect(
      sensorController.updateSensor("00:00:00:00:00:01", fakeSensorDAO)
    ).rejects.toThrow(ConflictError);
  });

  it("T5.1: delete Sensor: mapperService integration", async () => {
    const fakeSensorDAO: SensorDAO = {
      macAddress: "00:00:00:00:00:01",
      name: "Test Sensor",
      description: "This is a test sensor",
      variable: "Temperature",
      unit: "Celsius",
      gateway: null,
      measurements: [],
    };

    const deleteSensorMock = jest.fn().mockResolvedValue(fakeSensorDAO);
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      deleteSensor: deleteSensorMock,
    }));

    await sensorController.deleteSensor(fakeSensorDAO.macAddress);

    expect(deleteSensorMock).toHaveBeenCalledWith(fakeSensorDAO.macAddress);
  });

  it("T5.2: delete Sensor: mapperService integration with not found error", async () => {
    const fakeMacAddress = "00:00:00:00:00:01";

    const deleteSensorMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(
        `Sensor with MAC address '${fakeMacAddress}' not found`
      );
    });
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      deleteSensor: deleteSensorMock,
    }));

    await expect(sensorController.deleteSensor(fakeMacAddress)).rejects.toThrow(
      NotFoundError
    );
  });
});
