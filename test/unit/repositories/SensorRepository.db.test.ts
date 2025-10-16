/**
 * SensorRepository Database Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Function being tested (1=createSensor, 2=getSensorByMacAddress, 3=updateSensor, 4=getAllSensors, 5=deleteSensor)
 * - y: Test number for that function
 *
 * Test Structure:
 * T1.1: create sensor - tests successful sensor creation
 * T1.2: create sensor: conflict - tests creation failure when sensor MAC address already exists
 * T2.1: find sensor by macAddress: not found - tests error when sensor MAC address doesn't exist
 * T2.2: find sensor by macAddress - tests successful retrieval of sensor by MAC address
 * T3.1: update sensor: not mac address - tests successful sensor update without changing MAC address
 * T3.2: update sensor: change mac address - tests successful sensor update with MAC address change
 * T3.3: update sensor: conflict - tests update failure when new MAC address conflicts with existing sensor
 * T3.4: update sensor: not found - tests error when trying to update non-existent sensor
 * T4.1: get all sensors - tests successful retrieval of all sensors
 * T4.2: get sensor by macAddress: not found - tests error when sensor MAC address doesn't exist (duplicate test)
 * T5.1: delete sensor - tests successful sensor deletion
 * T5.2: delete sensor: not found - tests error when trying to delete non-existent sensor
 */

import { SensorRepository } from "@repositories/SensorRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource,
} from "@test/setup/test-datasource";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(SensorDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("SensorRepository: SQLite in-memory", () => {
  const repo = new SensorRepository();

  it("T1.1: create sensor", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    const sensor = await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      gateway
    );
    expect(sensor).toMatchObject({
      macAddress: "00:00:00:00:00:01",
      name: "Sensor1",
      description: "Test sensor",
      variable: "temperature",
      unit: "Celsius",
      gateway: "94:3F:BE:4C:4A:79",
    });

    const found = await repo.getSensorByMacAddress("00:00:00:00:00:01");
    expect(found.macAddress).toBe("00:00:00:00:00:01");
  });

  it("T1.2: create sensor: conflict", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      gateway
    );

    await expect(
      repo.createSensor(
        "00:00:00:00:00:01",
        "Another",
        "Desc",
        "humidity",
        "Percent",
        gateway
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T2.1: find sensor by macAddress: not found", async () => {
    await expect(
      repo.getSensorByMacAddress("00:00:00:00:00:00")
    ).rejects.toThrow(NotFoundError);
  });

  it("T2.2: find sensor by macAddress", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      gateway
    );
    const found = await repo.getSensorByMacAddress("00:00:00:00:00:01");

    expect(found).toMatchObject({
      macAddress: "00:00:00:00:00:01",
      name: "Sensor1",
      description: "Test sensor",
      variable: "temperature",
      unit: "Celsius",
      gateway: "94:3F:BE:4C:4A:79",
    });
  });

  it("T3.1: update sensor: not mac address", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    const sensor = await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      gateway
    );

    const updatedSensor = await repo.updateSensor(
      sensor.macAddress,
      sensor.macAddress,
      "Updated Sensor",
      "Updated description",
      "pressure",
      "Pascal"
    );

    expect(updatedSensor).toMatchObject({
      macAddress: sensor.macAddress,
      name: "Updated Sensor",
      description: "Updated description",
      variable: "pressure",
      unit: "Pascal",
      gateway: "94:3F:BE:4C:4A:79",
    });
  });

  it("T3.2: update sensor: change mac address", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    const sensor = await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      gateway
    );

    const updatedSensor = await repo.updateSensor(
      sensor.macAddress,
      "00:00:00:00:00:02",
      "Updated Sensor",
      "Updated description",
      "pressure",
      "Pascal"
    );

    expect(updatedSensor).toMatchObject({
      macAddress: "00:00:00:00:00:02",
      name: "Updated Sensor",
      description: "Updated description",
      variable: "pressure",
      unit: "Pascal",
      gateway: "94:3F:BE:4C:4A:79",
    });
  });

  it("T3.3: update sensor: conflict", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor1",
      "temperature",
      "Celsius",
      gateway
    );

    await repo.createSensor(
      "00:00:00:00:00:02",
      "Sensor2",
      "Test sensor2",
      "temperature",
      "Celsius",
      gateway
    );

    await expect(
      repo.updateSensor(
        "00:00:00:00:00:02",
        "00:00:00:00:00:01",
        "Sensor1",
        "Test sensor1",
        "temperature",
        "Celsius"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T3.4: update sensor: not found", async () => {
    await expect(
      repo.updateSensor(
        "00:00:00:00:00:01",
        "00:00:00:00:00:02",
        "Sensor1",
        "Test sensor",
        "temperature",
        "Celsius"
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("T4.1: get all sensors", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    const sensor1 = await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      gateway
    );

    const sensor2 = await repo.createSensor(
      "00:00:00:00:00:02",
      "Sensor2",
      "Another sensor",
      "humidity",
      "Percent",
      gateway
    );

    const result = await repo.getAllSensors();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject(sensor1);
    expect(result[1]).toMatchObject(sensor2);
  });

  it("T4.2: get sensor by macAddress: not found", async () => {
    await expect(
      repo.getSensorByMacAddress("00:00:00:00:00:00")
    ).rejects.toThrow(NotFoundError);
  });

  it("T5.1: delete sensor", async () => {
    const network = new NetworkDAO();
    network.code = "NET01";
    network.name = "Test Network";
    network.description = "Test network description";
    await TestDataSource.getRepository(NetworkDAO).save(network);

    const gateway = new GatewayDAO();
    gateway.macAddress = "94:3F:BE:4C:4A:79";
    gateway.name = "Gateway1";
    gateway.description = "Test gateway";
    gateway.network = network;
    await TestDataSource.getRepository(GatewayDAO).save(gateway);

    const sensor = await repo.createSensor(
      "00:00:00:00:00:01",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      gateway
    );

    await repo.deleteSensor(sensor.macAddress);
    await expect(repo.getSensorByMacAddress(sensor.macAddress)).rejects.toThrow(
      NotFoundError
    );
  });

  it("T5.2: delete sensor: not found", async () => {
    await expect(repo.deleteSensor("00:00:00:00:00:01")).rejects.toThrow(
      NotFoundError
    );
  });
});
