/**
 * Test naming convention: TMx.y where x represents the function being tested and y represents the nth test for that same function
 *
 * Test organization:
 * - TM1.x: createMeasurement - Test per la funzione di creazione measurement
 *   - TM1.1: create measurement - Test di creazione base
 *   - TM1.2: create measurement: conflict - Test di conflitto (duplicato)
 *   - TM1.3: create measurement: sensor with undefined key - Test con sensor undefined
 *   - TM1.4: create measurement: gateway with undefined key - Test con gateway undefined
 *
 * - TM2.x: getMeasurementsByGatewayAndSensor - Test per la funzione di ricerca measurement singola
 *   - TM2.1: get measurement: sensor macAddress is null - Test con sensor null
 *   - TM2.2: get measurement: gateway macAddress is null - Test con gateway null
 *   - TM2.3: get measurement: without date filtering - Test senza filtri di data
 *   - TM2.4: get measurement: with filter only from date - Test con filtro data inizio
 *   - TM2.5: get measurement: with filter only to date - Test con filtro data fine
 *   - TM2.6: get measurement: with filter between dates - Test con range di date
 *   - TM2.7: get measurement: with measures outside date filters - Test con date fuori range
 *   - TM2.8: get measurement: no measurements exist - Test senza measurement esistenti
 *
 * - TM3.x: getMeasurementsByGatewaysAndSensors - Test per la funzione di ricerca measurement multipla
 *   - TM3.1: get measurements by gateways without filters - Test con gateway multipli senza filtri
 *   - TM3.2: get measurements by empty gateways list returns empty array - Test con lista gateway vuota
 *   - TM3.3: get measurements by gateways and specific sensors - Test con gateway e sensor specifici
 *   - TM3.4: get measurements by gateways with empty sensors list - Test con lista sensor vuota
 *   - TM3.5: get measurements by gateways and date range - Test con gateway e range date
 *   - TM3.6: get measurements by gateways, sensors, and date range - Test completo con tutti i filtri
 *   - TM3.7: get measurements by gateways and sensors with measures outside date filters - Test con date fuori range
 *   - TM3.8: returns an empty array if gateways array is null - Test con array gateway null
 *   - TM3.9: filters null keys in sensorMacAddresses - Test filtro chiavi null nei sensor
 *   - TM3.10: filters undefined gateways from input array - Test filtro gateway undefined
 *   - TM3.11: correctly formats returned measurement objects - Test formato oggetti restituiti
 */

import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

const mockFind = jest.fn();
const mockSave = jest.fn();

jest.mock("@database", () => ({
  AppDataSource: {
    getRepository: () => ({
      find: mockFind,
      save: mockSave,
    }),
  },
}));

describe("MeasurementRepository: mocked database", () => {
  const repo = new MeasurementRepository();
  const gateway1 = new GatewayDAO();
  gateway1.macAddress = "gateway-mac-1";
  const sensor1 = new SensorDAO();
  sensor1.macAddress = "sensor-mac-1";
  const gateway2 = new GatewayDAO();
  gateway2.macAddress = "gateway-mac-2";
  const sensor2 = new SensorDAO();
  sensor2.macAddress = "sensor-mac-2";
  const baseDate = new Date();
  const measurement1 = {
    createdAt: baseDate,
    sensor: sensor1,
    gateway: gateway1,
    sensorMacAddress: sensor1.macAddress,
    gatewayMacAddress: gateway1.macAddress,
    value: 42,
  } as MeasurementDAO;
  const measurementsMocked = new Array();
  const dateArray = Array.from({ length: 10 }, (_, i) => {
    const date = new Date(baseDate);
    date.setMinutes(date.getMinutes() + i * 10);
    return date;
  });

  // Create measurements for sensor1 and gateway1
  for (const date of dateArray) {
    measurementsMocked.push({
      createdAt: date,
      sensor: sensor1,
      gateway: gateway1,
      value: Math.floor(Math.random() * 100),
    } as MeasurementDAO);
  }

  // Create measurements for sensor2 and gateway2
  for (const date of dateArray) {
    measurementsMocked.push({
      createdAt: date,
      sensor: sensor2,
      gateway: gateway2,
      value: Math.floor(Math.random() * 100),
    } as MeasurementDAO);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Creation test

  it("TM1.1: create measurement", async () => {
    mockFind.mockResolvedValue([]);
    mockSave.mockResolvedValue(measurement1);

    const measurement = await repo.createMeasurement(
      baseDate,
      sensor1,
      gateway1,
      42
    );

    expect(measurement).toMatchObject({
      value: 42,
      sensor: sensor1,
      gateway: gateway1,
      createdAt: baseDate,
    });
  });

  it("TM1.2: create measurement: conflict", async () => {
    mockFind.mockResolvedValue([measurement1]);

    await expect(
      repo.createMeasurement(baseDate, sensor1, gateway1, 42)
    ).rejects.toThrow(ConflictError);
  });

  it("TM1.3: create measurement: sensor with undefined key", async () => {
    const sensorWithUndefinedMac = new SensorDAO();
    sensorWithUndefinedMac.macAddress = undefined;
    mockFind.mockResolvedValue([]);

    await expect(
      repo.createMeasurement(baseDate, sensorWithUndefinedMac, gateway1, 42)
    ).rejects.toThrow(NotFoundError);
  });

  it("TM1.4: create measurement: gateway with undefined key", async () => {
    const gatewayWithUndefinedMac = new GatewayDAO();
    gatewayWithUndefinedMac.macAddress = undefined;
    mockFind.mockResolvedValue([]);

    await expect(
      repo.createMeasurement(baseDate, sensor1, gatewayWithUndefinedMac, 42)
    ).rejects.toThrow(NotFoundError);
  });

  // get by gateway and sensor tests

  it("TM2.1: get measurement: sensor macAddress is null", async () => {
    const sensorWithNullMac = new SensorDAO();
    sensorWithNullMac.macAddress = null;
    mockFind.mockResolvedValue(measurement1);

    await expect(
      repo.createMeasurement(baseDate, sensorWithNullMac, gateway1, 42)
    ).rejects.toThrow(NotFoundError);
  });

  it("TM2.2: get measurement: gateway macAddress is null", async () => {
    const gatewayWithNullMac = new GatewayDAO();
    gatewayWithNullMac.macAddress = null;
    mockFind.mockResolvedValue(measurement1);

    await expect(
      repo.createMeasurement(baseDate, sensor1, gatewayWithNullMac, 42)
    ).rejects.toThrow(NotFoundError);
  });

  it("TM2.3: get measurement: without date filtering", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.sensor.macAddress === sensor1.macAddress &&
          m.gateway.macAddress === gateway1.macAddress
      )
    );
    const resultMeasurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1
    );
    expect(resultMeasurements.length).toBe(10);
  });

  it("TM2.4: get measurement: with filter only from date", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.sensor.macAddress === sensor1.macAddress &&
          m.gateway.macAddress === gateway1.macAddress &&
          m.createdAt >= dateArray[1]
      )
    );
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      dateArray[1]
    );
    expect(measurements).toHaveLength(9);
  });

  it("TM2.5: get measurement: with filter only to date", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.sensor.macAddress === sensor1.macAddress &&
          m.gateway.macAddress === gateway1.macAddress &&
          m.createdAt <= dateArray[8]
      )
    );
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      undefined,
      dateArray[8]
    );
    expect(measurements).toHaveLength(9);
  });

  it("TM2.6: get measurement: with filter between dates", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.sensor.macAddress === sensor1.macAddress &&
          m.gateway.macAddress === gateway1.macAddress &&
          m.createdAt >= dateArray[1] &&
          m.createdAt <= dateArray[8]
      )
    );
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      dateArray[1],
      dateArray[8]
    );
    expect(measurements).toHaveLength(8);
  });

  it("TM2.7: get measurement: with measures outside date filters", async () => {
    mockFind.mockResolvedValue([]);
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      new Date(baseDate.getTime() + 10 * 60 * 60 * 1000)
    );
    expect(measurements).toHaveLength(0);
    expect(measurements).toEqual([]);
  });

  it("TM2.8: get measurement: no measurements exist", async () => {
    mockFind.mockResolvedValue([]);
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway2,
      sensor2
    );
    expect(measurements).toEqual([]);
  });

  // get measures by gateway array and sensor array  test

  it("TM3.1: get measurements by gateways without filters", async () => {
    mockFind.mockResolvedValue(measurementsMocked);
    const measurements = await repo.getMeasurementsByGatewaysAndSensors([
      gateway1,
      gateway2,
    ]);
    expect(measurements.length).toBe(20);
  });

  it("TM3.2: get measurements by empty gateways list returns empty array", async () => {
    mockFind.mockResolvedValue([]);
    const measurements = await repo.getMeasurementsByGatewaysAndSensors([]);
    expect(measurements).toEqual([]);
  });

  it("TM3.3: get measurements by gateways and specific sensors", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          (m.gateway.macAddress === gateway1.macAddress ||
            m.gateway.macAddress === gateway2.macAddress) &&
          m.sensor.macAddress === sensor1.macAddress
      )
    );
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, gateway2],
      [sensor1.macAddress]
    );
    expect(measurements.length).toBe(10);
  });

  it("TM3.4: get measurements by gateways with empty sensors list", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.gateway.macAddress === gateway1.macAddress ||
          m.gateway.macAddress === gateway2.macAddress
      )
    );
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, gateway2],
      []
    );
    expect(measurements.length).toBe(20);
  });

  it("TM3.5: get measurements by gateways and date range", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.gateway.macAddress === gateway1.macAddress &&
          m.createdAt >= dateArray[1] &&
          m.createdAt <= dateArray[8]
      )
    );
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      undefined,
      dateArray[1],
      dateArray[8]
    );
    expect(measurements.length).toBe(8);
  });

  it("TM3.6: get measurements by gateways, sensors, and date range", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          (m.gateway.macAddress === gateway1.macAddress ||
            m.gateway.macAddress === gateway2.macAddress) &&
          m.createdAt >= dateArray[1] &&
          m.createdAt <= dateArray[8] &&
          m.sensor.macAddress === sensor1.macAddress
      )
    );
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, gateway2],
      [sensor1.macAddress],
      dateArray[1],
      dateArray[8]
    );
    expect(measurements.length).toBe(8);
  });

  it("TM3.7: get measurements by gateways and sensors with measures outside date filters", async () => {
    mockFind.mockResolvedValue([]);
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      undefined,
      new Date(baseDate.getTime() + 10 * 60 * 60 * 1000)
    );
    expect(measurements).toHaveLength(0);
    expect(measurements).toEqual([]);
  });

  it("TM3.8: returns an empty array if gateways array is null", async () => {
    mockFind.mockReturnValue(measurementsMocked);

    const measurements = await repo.getMeasurementsByGatewaysAndSensors([]);
    expect(measurements).toEqual([]);
  });

  it("TM3.9: filters null keys in sensorMacAddresses", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.gateway.macAddress === gateway1.macAddress &&
          m.sensor.macAddress === sensor1.macAddress
      )
    );

    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      [sensor1.macAddress, null, undefined]
    );

    expect(measurements.length).toBe(10);
    measurements.forEach((m) => {
      expect(m.sensor.macAddress).toBe(sensor1.macAddress);
    });
  });

  it("TM3.10: filters undefined gateways from input array", async () => {
    mockFind.mockResolvedValue(
      measurementsMocked.filter(
        (m) =>
          m.gateway.macAddress === gateway1.macAddress &&
          m.sensor.macAddress === sensor1.macAddress
      )
    );

    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, undefined, null],
      [sensor1.macAddress]
    );

    expect(measurements.length).toBe(10);
  });

  it("TM3.11: correctly formats returned measurement objects", async () => {
    mockFind.mockResolvedValue([measurement1]);

    const measurements = await repo.getMeasurementsByGatewaysAndSensors([
      gateway1,
    ]);

    expect(measurements).toHaveLength(1);
    expect(measurements[0]).toMatchObject({
      value: 42,
      createdAt: baseDate,
      sensor: sensor1,
      gateway: gateway1,
    });
  });
});
