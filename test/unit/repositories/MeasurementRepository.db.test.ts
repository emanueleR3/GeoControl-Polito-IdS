/**
 * Test naming convention: Tx.y where x represents the function being tested and y represents the nth test for that same function
 *
 * Test organization:
 * - T1.x: createMeasurement - Test per la funzione di creazione measurement
 *   - T1.1: create measurement - Test di creazione base
 *   - T1.2: create measurement: conflict - Test di conflitto (duplicato)
 *   - T1.3: create measurement: sensor with undefined key - Test con sensor undefined
 *   - T1.4: create measurement: gateway with undefined key - Test con gateway undefined
 *
 * - T2.x: getMeasurementsByGatewayAndSensor - Test per la funzione di ricerca measurement singola
 *   - T2.1: get measurement: sensor macAddress is null - Test con sensor null
 *   - T2.2: get measurement: gateway macAddress is null - Test con gateway null
 *   - T2.3: get measurement: without date filtering - Test senza filtri di data
 *   - T2.4: get measurement: with filter only from date - Test con filtro data inizio
 *   - T2.5: get measurement: with filter only to date - Test con filtro data fine
 *   - T2.6: get measurement: with filter between dates - Test con range di date
 *   - T2.7: get measurement: with measures outside date filters - Test con date fuori range
 *   - T2.8: get measurement: no measurements exist - Test senza measurement esistenti
 *
 * - T3.x: getMeasurementsByGatewaysAndSensors - Test per la funzione di ricerca measurement multipla
 *   - T3.1: get measurements by gateways without filters - Test con gateway multipli senza filtri
 *   - T3.2: get measurements by empty gateways list returns empty array - Test con lista gateway vuota
 *   - T3.3: get measurements by gateways and specific sensors - Test con gateway e sensor specifici
 *   - T3.4: get measurements by gateways with empty sensors list - Test con lista sensor vuota
 *   - T3.5: get measurements by gateways and date range - Test con gateway e range date
 *   - T3.6: get measurements by gateways, sensors, and date range - Test completo con tutti i filtri
 *   - T3.7: get measurements by gateways and sensors with measures outside date filters - Test con date fuori range
 *   - T3.8: get measurements by gateways and sensors with only start date filter - Test con solo data inizio
 *   - T3.9: get measurements by gateways and sensors with only end date filter - Test con solo data fine
 *   - T3.10: get measurements by gateways returns empty array when no measurements exist - Test senza measurement
 *   - T3.11: returns an empty array if gateways array is null - Test con array gateway null
 *   - T3.12: filters null keys in sensorMacAddresses - Test filtro chiavi null nei sensor
 *   - T3.13: filters undefined gateways from input array - Test filtro gateway undefined
 *   - T3.14: correctly formats returned measurement objects - Test formato oggetti restituiti
 */

import { MeasurementRepository } from "@repositories/MeasurementRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource,
} from "@test/setup/test-datasource";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

describe("MeasurementRepository: SQLite in-memory", () => {
  const repo = new MeasurementRepository();
  let network: NetworkDAO;
  let gateway1: GatewayDAO;
  let gateway2: GatewayDAO;
  let sensor1: SensorDAO;
  let sensor2: SensorDAO;

  beforeEach(async () => {
    // Clear all test data
    await TestDataSource.getRepository(MeasurementDAO).clear();
    await TestDataSource.getRepository(GatewayDAO).clear();
    await TestDataSource.getRepository(SensorDAO).clear();
    await TestDataSource.getRepository(NetworkDAO).clear();

    // Create test network first
    network = await TestDataSource.getRepository(NetworkDAO).save({
      code: "test-network",
      name: "Test Network",
      description: "Test Network Description"
    });

    // Create and save test gateways with network reference
    gateway1 = await TestDataSource.getRepository(GatewayDAO).save({
      macAddress: "gateway-mac-1",
      name: "Gateway 1",
      description: "Test Gateway 1",
      network: network
    });
    
    gateway2 = await TestDataSource.getRepository(GatewayDAO).save({
      macAddress: "gateway-mac-2",
      name: "Gateway 2",
      description: "Test Gateway 2",
      network: network
    });
    
    // Create and save test sensors with gateway references
    sensor1 = await TestDataSource.getRepository(SensorDAO).save({
      macAddress: "sensor-mac-1",
      name: "Sensor 1",
      description: "Test Sensor 1",
      variable: "temperature",
      unit: "celsius",
      gateway: gateway1
    });
    
    sensor2 = await TestDataSource.getRepository(SensorDAO).save({
      macAddress: "sensor-mac-2",
      name: "Sensor 2",
      description: "Test Sensor 2",
      variable: "humidity",
      unit: "percent",
      gateway: gateway2
    });
  });
  const baseDate = new Date();
  const dateArray = new Array();
  for (let i = 0; i < 10; i++) {
    const date = new Date(baseDate);
    date.setMinutes(date.getMinutes() + i * 10);
    dateArray.push(date);
  }

  //Creation test

  it("T1.1: create measurement", async () => {
    const measurement = await repo.createMeasurement(
      baseDate,
      sensor1,
      gateway1,
      42
    );

    expect(measurement).toMatchObject({
      value: 42,
      sensorMacAddress: sensor1.macAddress,
      gatewayMacAddress: gateway1.macAddress,
      createdAt: baseDate,
    });
  });

  it("T1.2: create measurement: conflict", async () => {
    await repo.createMeasurement(baseDate, sensor1, gateway1, 42);

    await expect(
      repo.createMeasurement(baseDate, sensor1, gateway1, 42)
    ).rejects.toThrow(ConflictError);
  });

  it("T1.3: create measurement: sensor with undefined key", async () => {
    const sensorWithUndefinedMac = new SensorDAO();
    sensorWithUndefinedMac.macAddress = undefined;

    await expect(
      repo.createMeasurement(baseDate, sensorWithUndefinedMac, gateway1, 42)
    ).rejects.toThrow(NotFoundError);
  });

  it("T1.4: create measurement: gateway with undefined key", async () => {
    const gatewayWithUndefinedMac = new GatewayDAO();
    gatewayWithUndefinedMac.macAddress = undefined;

    await expect(
      repo.createMeasurement(baseDate, sensor1, gatewayWithUndefinedMac, 42)
    ).rejects.toThrow(NotFoundError);
  });

  // get by gateway and sensor tests

  it("T2.1: get measurement: sensor macAddress is null", async () => {
    const sensorWithNullMac = new SensorDAO();
    sensorWithNullMac.macAddress = null;

    await expect(
      repo.createMeasurement(baseDate, sensorWithNullMac, gateway1, 42)
    ).rejects.toThrow(NotFoundError);
  });

  it("T2.2: get measurement: gateway macAddress is null", async () => {
    const gatewayWithNullMac = new GatewayDAO();
    gatewayWithNullMac.macAddress = null;

    await expect(
      repo.createMeasurement(baseDate, sensor1, gatewayWithNullMac, 42)
    ).rejects.toThrow(NotFoundError);
  });

  it("T2.3: get measurement: without date filtering", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1
    );
    expect(measurements.length).toBe(10);
  });

  it("T2.4: get measurement: with filter only from date", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      dateArray[1]
    );
    expect(measurements).toHaveLength(9);
  });

  it("T2.5: get measurement: with filter only to date", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      undefined,
      dateArray[8]
    );
    expect(measurements).toHaveLength(9);
  });

  it("T2.6: get measurement: with filter between dates", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      dateArray[1],
      dateArray[8]
    );
    expect(measurements).toHaveLength(8);
  });

  it("T2.7: get measurement: with measures outside date filters", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway1,
      sensor1,
      new Date(baseDate.getTime() + 10 * 60 * 60 * 1000)
    );
    expect(measurements).toHaveLength(0);
    expect(measurements).toEqual([]);
  });

  it("T2.8: get measurement: no measurements exist", async () => {
    const measurements = await repo.getMeasurementsByGatewayAndSensor(
      gateway2,
      sensor2
    );
    expect(measurements).toEqual([]);
  });

  // get measures by gateway array and sensor array  test

  it("T3.1: get measurements by gateways without filters", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
      await repo.createMeasurement(
        date,
        sensor2,
        gateway2,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors([
      gateway1,
      gateway2,
    ]);
    expect(measurements.length).toBe(20);
  });

  it("T3.2: get measurements by empty gateways list returns empty array", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
      await repo.createMeasurement(
        date,
        sensor2,
        gateway2,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors([]);
    expect(measurements).toEqual([]);
  });

  it("T3.3: get measurements by gateways and specific sensors", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
      await repo.createMeasurement(
        date,
        sensor2,
        gateway2,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, gateway2],
      [sensor1.macAddress]
    );
    expect(measurements.length).toBe(10);
  });

  it("T3.4: get measurements by gateways with empty sensors list", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
      await repo.createMeasurement(
        date,
        sensor2,
        gateway2,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, gateway2],
      []
    );
    expect(measurements.length).toBe(20);
  });

  it("T3.5: get measurements by gateways and date range", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      undefined,
      dateArray[1],
      dateArray[8]
    );
    expect(measurements.length).toBe(8);
  });

  it("T3.6: get measurements by gateways, sensors, and date range", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
      await repo.createMeasurement(
        date,
        sensor2,
        gateway2,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, gateway2],
      [sensor1.macAddress],
      dateArray[1],
      dateArray[8]
    );
    expect(measurements.length).toBe(8);
  });

  it("T3.7: get measurements by gateways and sensors with measures outside date filters", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      undefined,
      new Date(baseDate.getTime() + 10 * 60 * 60 * 1000)
    );
    expect(measurements).toHaveLength(0);
    expect(measurements).toEqual([]);
  });

  it("T3.8: get measurements by gateways and sensors with only start date filter", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      undefined,
      dateArray[1]
    );
    expect(measurements).toHaveLength(9);
  });

  it("T3.9: get measurements by gateways and sensors with only end date filter", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }
    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      undefined,
      undefined,
      dateArray[8]
    );
    expect(measurements).toHaveLength(9);
  });

  it("T3.10: get measurements by gateways returns empty array when no measurements exist", async () => {
    const measurements = await repo.getMeasurementsByGatewaysAndSensors([
      gateway1,
      gateway2,
    ]);
    expect(measurements).toEqual([]);
  });

  it("T3.11: returns an empty array if gateways array is null", async () => {
    const measurements = await repo.getMeasurementsByGatewaysAndSensors([]);
    expect(measurements).toEqual([]);
  });

  it("T3.12: filters null keys in sensorMacAddresses", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }

    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1],
      [sensor1.macAddress, null, undefined]
    );

    expect(measurements.length).toBe(10);
    measurements.forEach((m) => {
      expect(m.sensorMacAddress).toBe(sensor1.macAddress);
    });
  });

  it("T3.13: filters undefined gateways from input array", async () => {
    for (const date of dateArray) {
      await repo.createMeasurement(
        date,
        sensor1,
        gateway1,
        Math.floor(Math.random() * 100)
      );
    }

    const measurements = await repo.getMeasurementsByGatewaysAndSensors(
      [gateway1, undefined, null],
      [sensor1.macAddress]
    );

    expect(measurements.length).toBe(10);
  });

  it("T3.14: correctly formats returned measurement objects", async () => {
    const testDate = dateArray[0];
    const testValue = 42;

    await repo.createMeasurement(testDate, sensor1, gateway1, testValue);

    const measurements = await repo.getMeasurementsByGatewaysAndSensors([
      gateway1,
    ]);

    expect(measurements).toHaveLength(1);
    expect(measurements[0]).toMatchObject({
      value: testValue,
      createdAt: testDate,
      sensorMacAddress: sensor1.macAddress,
      gatewayMacAddress: gateway1.macAddress,
    });
  });
});
