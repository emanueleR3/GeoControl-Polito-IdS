import * as measurementController from "@controllers/measurementController";
import { MeasurementDAO } from "@dao/MeasurementDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { SensorDAO } from "@models/dao/SensorDAO";

/**
 * Measurement Controller Integration Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Controller function being tested (1=getNetworkMeasurements, 2=getNetworkStats, 3=getNetworkOutliers, 4=createSensorMeasurement, 5=getSensorMeasurementWithStats, 6=getSensorStats, 7=getSensorOutliers)
 * - y: Test number for that function
 *
 * Test Structure:
 * T1.1: getNetworkMeasurements - tests successful network measurements retrieval with mapper service integration
 * T1.2: getNetworkMeasurements: not found - tests NotFoundError handling with mapper service
 * T2.1: getNetworkStats - tests successful network stats retrieval with mapper service integration
 * T3.1: getNetworkOutliers - tests successful network outliers retrieval with mapper service integration
 * T4.1: createSensorMeasurement - tests successful sensor measurement creation with mapper service integration
 * T5.1: getSensorMeasurementWithStats - tests successful sensor measurement with stats retrieval with mapper service integration
 * T6.1: getSensorStats - tests successful sensor stats retrieval with mapper service integration
 * T7.1: getSensorOutliers - tests successful sensor outliers retrieval with mapper service integration
 */

jest.mock("@repositories/NetworkRepository", () => ({
  NetworkRepository: jest.fn().mockImplementation(() => ({
    getNetworkByCode: jest.fn().mockResolvedValue({
      gateways: [],
      code: "NET01",
      name: "",
      description: "",
    }),
  })),
}));
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { NotFoundError } from "@models/errors/NotFoundError";

jest.mock("@repositories/MeasurementRepository");

describe("MeasurementController integration", () => {
  it("T1.1: get Network Measurements: mapperService integration", async () => {
    const fakeMeasurementDAO: MeasurementDAO = {
      createdAt: new Date(),
      sensorMacAddress: "00:00:00:00:00:01",
      gatewayMacAddress: "00:00:00:00:00:02",
      sensor: null,
      gateway: null,
      value: 25.5,
    };

    const expectedDTO = {
      createdAt: fakeMeasurementDAO.createdAt,
      sensorMacAddress: fakeMeasurementDAO.sensorMacAddress,
      gatewayMacAddress: fakeMeasurementDAO.gatewayMacAddress,
      sensor: null,
      gateway: null,
      value: fakeMeasurementDAO.value,
    };

    (MeasurementRepository as jest.Mock).mockImplementation(() => ({
      getMeasurementsByGatewaysAndSensors: jest
        .fn()
        .mockResolvedValue([fakeMeasurementDAO]),
    }));

    const result = await measurementController.getNetworkMeasurements(
      "NET01",
      undefined,
      undefined,
      ["00:00:00:00:00:01"]
    );

    expect(result).toEqual([
      {
        sensorMacAddress: expectedDTO.sensorMacAddress,
        measurements: [
          {
            createdAt: expectedDTO.createdAt,
            value: expectedDTO.value,
            isOutlier: false,
          },
        ],
        stats: {
          mean: expectedDTO.value,
          variance: 0,
          lowerThreshold: expectedDTO.value,
          upperThreshold: expectedDTO.value,
        },
      },
    ]);
  });

  it("T1.2: get Network Measurements: mapperService integration with not found error", async () => {
    const fakeNetworkCode = "NET01";

    const getNetworkMock = jest.fn().mockImplementation(() => {
      throw new NotFoundError(
        `Network with code '${fakeNetworkCode}' not found`
      );
    });
    (MeasurementRepository as jest.Mock).mockImplementation(() => ({
      getMeasurementsByGatewaysAndSensors: getNetworkMock,
    }));

    await expect(
      measurementController.getNetworkMeasurements(fakeNetworkCode)
    ).rejects.toThrow(NotFoundError);
  });

  it("T2.1: get Network Stats: mapperService integration", async () => {
    const fakeMeasurementDAO: MeasurementDAO = {
      createdAt: new Date(),
      sensorMacAddress: "00:00:00:00:00:01",
      gatewayMacAddress: "00:00:00:00:00:02",
      sensor: null,
      gateway: null,
      value: 25.5,
    };

    const expectedDTO = {
      createdAt: fakeMeasurementDAO.createdAt,
      sensorMacAddress: fakeMeasurementDAO.sensorMacAddress,
      gatewayMacAddress: fakeMeasurementDAO.gatewayMacAddress,
      sensor: null,
      gateway: null,
      value: fakeMeasurementDAO.value,
    };

    (MeasurementRepository as jest.Mock).mockImplementation(() => ({
      getMeasurementsByGatewaysAndSensors: jest
        .fn()
        .mockResolvedValue([fakeMeasurementDAO]),
    }));

    const result = await measurementController.getNetworkStats(
      "NET01",
      ["00:00:00:00:00:01"],
      undefined,
      undefined
    );

    expect(result).toEqual([
      {
        sensorMacAddress: expectedDTO.sensorMacAddress,
        stats: {
          mean: expectedDTO.value,
          variance: 0,
          lowerThreshold: expectedDTO.value,
          upperThreshold: expectedDTO.value,
        },
      },
    ]);
  });

  it("T3.1: get Network Outliers: mapperService integration", async () => {
    const fakeMeasurementDAO: MeasurementDAO = {
      createdAt: new Date(),
      sensorMacAddress: "00:00:00:00:00:01",
      gatewayMacAddress: "00:00:00:00:00:02",
      sensor: null,
      gateway: null,
      value: 25.5,
    };

    const expectedDTO = {
      createdAt: fakeMeasurementDAO.createdAt,
      sensorMacAddress: fakeMeasurementDAO.sensorMacAddress,
      gatewayMacAddress: fakeMeasurementDAO.gatewayMacAddress,
      sensor: null,
      gateway: null,
      value: fakeMeasurementDAO.value,
    };

    (MeasurementRepository as jest.Mock).mockImplementation(() => ({
      getMeasurementsByGatewaysAndSensors: jest
        .fn()
        .mockResolvedValue([fakeMeasurementDAO]),
    }));

    const result = await measurementController.getNetworkOutliers(
      "NET01",
      ["00:00:00:00:00:01"],
      undefined,
      undefined
    );

    expect(result).toEqual([
      {
        sensorMacAddress: expectedDTO.sensorMacAddress,
        measurements: [], 
        stats: {
          mean: expectedDTO.value,
          variance: 0,
          lowerThreshold: expectedDTO.value,
          upperThreshold: expectedDTO.value,
        },
      },
    ]);
  });

  it("T4.1: createSensorMeasurement: successfully creates measurement", async () => {
    const createdAt = new Date();
    const value = 42.0;
    const sensorMac = "00:11:22:33:44:55";
    const gatewayMac = "66:77:88:99:AA:BB";
    const networkCode = "NET01";

    const mockSensor = {
      macAddress: sensorMac,
    };

    const mockGateway = {
      macAddress: gatewayMac,
      sensors: [mockSensor],
    };

    const mockNetwork = {
      gateways: [mockGateway],
      code: networkCode,
      name: "",
      description: "",
    };

    const createMeasurementMock = jest.fn();

    // Mock NetworkRepository
    const NetworkRepository =
      require("@repositories/NetworkRepository").NetworkRepository;
    NetworkRepository.mockImplementation(() => ({
      getNetworkByCode: jest.fn().mockResolvedValue(mockNetwork),
    }));

    // Mock MeasurementRepository
    const MeasurementRepository =
      require("@repositories/MeasurementRepository").MeasurementRepository;
    MeasurementRepository.mockImplementation(() => ({
      createMeasurement: createMeasurementMock,
    }));

    await measurementController.createSensorMeasurement(
      networkCode,
      gatewayMac,
      sensorMac,
      createdAt,
      value
    );

    // Expect that createMeasurement was called with correct arguments
    expect(createMeasurementMock).toHaveBeenCalledWith(
      createdAt,
      mockSensor,
      mockGateway,
      value
    );
  });

  it("T5.1: getSensorMeasurementWithStats: successfully retrieves measurement with stats", async () => {
    const mockMeasurement: MeasurementDAO = {
      createdAt: new Date("2024-01-01T00:00:00Z"),
      sensorMacAddress: "11:11:11:11:11:11",
      gatewayMacAddress: "22:22:22:22:22:22",
      value: 25.5,
      sensor: null,
      gateway: null,
    };

    const sensor: SensorDAO = {
      macAddress: "11:11:11:11:11:11",
      name: "Test Sensor",
      description: "",
      variable: "",
      unit: "",
      gateway: {} as GatewayDAO,
      measurements: [],
    };

    const gateway: GatewayDAO = {
      macAddress: "22:22:22:22:22:22",
      name: "Test Gateway",
      description: "",
      sensors: [sensor],
      measurements: [],
      network: {} as NetworkDAO,
    };

    sensor.gateway = gateway;

    const network: NetworkDAO = {
      code: "NET01",
      name: "Test Network",
      description: "",
      gateways: [gateway],
    };

    const NetworkRepository =
      require("@repositories/NetworkRepository").NetworkRepository;
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByCode: jest.fn().mockResolvedValue(network),
    }));

    (MeasurementRepository as jest.Mock).mockImplementation(() => ({
      getMeasurementsByGatewayAndSensor: jest
        .fn()
        .mockResolvedValue([mockMeasurement]),
    }));

    const result = await measurementController.getSensorMeasurementWithStats(
      "NET01",
      "22:22:22:22:22:22",
      "11:11:11:11:11:11",
      "2024-01-01T00:00:00Z",
      "2024-01-02T00:00:00Z"
    );

    expect(result.sensorMacAddress).toBe("11:11:11:11:11:11");
    expect(result.measurements?.length).toBe(1);
    expect(result.measurements?.[0].value).toBe(25.5);
    expect(result.stats?.mean).toBe(25.5);
  });

  it("T6.1: getSensorStats: successfully retrieves sensor stats", async () => {
    const mockStats = {
      mean: 25.5,
      variance: 0,
      lowerThreshold: 25.5,
      upperThreshold: 25.5,
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2024-01-02T00:00:00Z"),
    };

    const mockMeasurementsDTO = {
      sensorMacAddress: "11:11:11:11:11:11",
      measurements: [],
      stats: mockStats,
    };

    jest
      .spyOn(measurementController, "getSensorMeasurementWithStats")
      .mockResolvedValue(mockMeasurementsDTO);

    const result = await measurementController.getSensorStats(
      "NET01",
      "22:22:22:22:22:22",
      "11:11:11:11:11:11",
      "2024-01-01T00:00:00Z",
      "2024-01-02T00:00:00Z"
    );

    expect(result).toEqual(mockStats);
  });

  it("T7.1: getSensorOutliers: successfully retrieves sensor outliers", async () => {
    const mockSensor = {
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "",
      description: "",
      variable: "",
      unit: "",
      gateway: {} as GatewayDAO,
      measurements: [],
    };

    const mockGateway = {
      macAddress: "11:22:33:44:55:66",
      name: "",
      description: "",
      sensors: [mockSensor],
      measurements: [],
      network: {} as NetworkDAO,
    };
    mockSensor.gateway = mockGateway;

    const mockNetwork = {
      code: "NET01",
      name: "",
      description: "",
      gateways: [mockGateway],
    };

    const measurements = [
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 10,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: 70,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
      {
        createdAt: new Date(),
        value: -40,
        sensorMacAddress: mockSensor.macAddress,
        gatewayMacAddress: mockGateway.macAddress,
      },
    ];

    const NetworkRepository =
      require("@repositories/NetworkRepository").NetworkRepository;
    (NetworkRepository as jest.Mock).mockImplementation(() => ({
      getNetworkByCode: jest.fn().mockResolvedValue(mockNetwork),
    }));

    const MeasurementRepository =
      require("@repositories/MeasurementRepository").MeasurementRepository;
    (MeasurementRepository as jest.Mock).mockImplementation(() => ({
      getMeasurementsByGatewayAndSensor: jest
        .fn()
        .mockResolvedValue(measurements),
    }));

    const result = await measurementController.getSensorOutliers(
      "NET01",
      "11:22:33:44:55:66",
      "AA:BB:CC:DD:EE:FF"
    );

    expect(result.measurements).toHaveLength(2);
    expect(result.measurements.every((m) => m.isOutlier)).toBe(true);
    expect(result.measurements.map((m) => m.value).sort()).toEqual([-40, 70]);
  });

  // getGroupedMeasurementsByMac
});
