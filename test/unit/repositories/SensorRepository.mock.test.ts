/**
 * SensorRepository Mock Tests
 *
 * Test Naming Convention: Tx.y
 * - x: Function being tested (1=createSensor, 2=updateSensor, 3=getAllSensors, 4=getSensorByMacAddress, 5=deleteSensor)
 * - y: Test number for that function
 *
 * Test Structure:
 * T1.1: create sensor - tests successful sensor creation
 * T1.2: create sensor: conflict - tests creation failure when sensor MAC address already exists
 * T2.1: update sensor - tests successful sensor update
 * T2.2: update sensor: conflict - tests update failure when new MAC address conflicts with existing sensor
 * T2.3: update sensor: not found - tests error when trying to update non-existent sensor
 * T3.1: get all sensors - tests successful retrieval of all sensors
 * T4.1: get sensor by macAddress - tests successful retrieval of sensor by MAC address
 * T4.2: get sensor by macAddress: not found - tests error when sensor MAC address doesn't exist
 * T5.1: delete sensor - tests successful sensor deletion
 * T5.2: delete sensor: not found - tests error when trying to delete non-existent sensor
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

import { SensorRepository } from "@repositories/SensorRepository";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";

describe("SensorRepository: mocked database", () => {
  const repo = new SensorRepository();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("T1.1: create sensor", async () => {
    mockFind.mockResolvedValue([]);

    const savedSensor = new SensorDAO();
    savedSensor.macAddress = "94:3F:BE:4C:4A:79";
    savedSensor.name = "Sensor1";
    savedSensor.description = "Test sensor";
    savedSensor.variable = "temperature";
    savedSensor.unit = "Celsius";
    savedSensor.gateway = new GatewayDAO();

    mockSave.mockResolvedValue(savedSensor);

    const result = await repo.createSensor(
      "94:3F:BE:4C:4A:79",
      "Sensor1",
      "Test sensor",
      "temperature",
      "Celsius",
      savedSensor.gateway
    );

    expect(result).toBeInstanceOf(SensorDAO);
    expect(result).toBe(savedSensor);
    expect(mockSave).toHaveBeenCalled();
  });

  it("T1.2: create sensor: conflict", async () => {
    const existingSensor = new SensorDAO();
    existingSensor.macAddress = "94:3F:BE:4C:4A:79";

    mockFind.mockResolvedValue([existingSensor]);

    await expect(
      repo.createSensor(
        "94:3F:BE:4C:4A:79",
        "Sensor1",
        "Test sensor",
        "temperature",
        "Celsius",
        new GatewayDAO()
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T2.1: update sensor", async () => {
    const existingSensor = new SensorDAO();
    existingSensor.macAddress = "94:3F:BE:4C:4A:79";
    existingSensor.name = "Old Sensor";
    existingSensor.description = "Old description";
    existingSensor.variable = "humidity";    existingSensor.unit = "Percentage";
    
    mockFind.mockResolvedValue([existingSensor]);
    mockUpdate.mockImplementation(async (_, updateData) => {
        existingSensor.name = updateData.name;
        existingSensor.description = updateData.description;
        existingSensor.variable = updateData.variable;
        existingSensor.unit = updateData.unit;
    });
    mockFind.mockImplementationOnce(() => [existingSensor]);

    const updatedResult = await repo.updateSensor(
      "94:3F:BE:4C:4A:79",
      "94:3F:BE:4C:4A:79",
      "Updated Sensor",
      "Updated description",
      "temperature",
      "Celsius"
    );

    expect(updatedResult).toBeInstanceOf(SensorDAO);
    expect(updatedResult.name).toBe("Updated Sensor");
    expect(updatedResult.description).toBe("Updated description");
    expect(updatedResult.variable).toBe("temperature");
    expect(updatedResult.unit).toBe("Celsius");
    //expect(mockSave).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("T2.2: update sensor: conflict", async () => {
    const existingSensor = new SensorDAO();
    existingSensor.macAddress = "94:3F:BE:4C:4A:79";

    mockFind.mockResolvedValue([existingSensor]);

    await expect(
      repo.updateSensor(
        "00:00:00:00:00:00",
        "94:3F:BE:4C:4A:79",
        "Sensor1",
        "Test sensor",
        "temperature",
        "Celsius"
      )
    ).rejects.toThrow(ConflictError);
  });

  it("T2.3: update sensor: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(
      repo.updateSensor(
        "00:00:00:00:00:00",
        "00:00:00:00:00:00",
        "Sensor1",
        "Test sensor",
        "temperature",
        "Celsius"
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("T3.1: get all sensors", async () => {
    const sensor1 = new SensorDAO();
    sensor1.macAddress = "94:3F:BE:4C:4A:79";
    sensor1.name = "Sensor1";

    const sensor2 = new SensorDAO();
    sensor2.macAddress = "00:00:00:00:00:01";
    sensor2.name = "Sensor2";

    mockFind.mockResolvedValue([sensor1, sensor2]);

    const result = await repo.getAllSensors();

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(sensor1);
    expect(result[1]).toBe(sensor2);
  });

  it("T4.1: get sensor by macAddress", async () => {
    const foundSensor = new SensorDAO();
    foundSensor.macAddress = "94:3F:BE:4C:4A:79";

    mockFind.mockResolvedValue([foundSensor]);

    const result = await repo.getSensorByMacAddress("94:3F:BE:4C:4A:79");
    expect(result).toBe(foundSensor);
    expect(result.macAddress).toBe("94:3F:BE:4C:4A:79");
  });

  it("T4.2: get sensor by macAddress: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(
      repo.getSensorByMacAddress("00:00:00:00:00:00")
    ).rejects.toThrow(NotFoundError);
  });

  it("T5.1: delete sensor", async () => {
    const sensorToDelete = new SensorDAO();
    sensorToDelete.macAddress = "94:3F:BE:4C:4A:79";

    mockFind.mockResolvedValue([sensorToDelete]);

    await repo.deleteSensor("94:3F:BE:4C:4A:79");

    expect(mockRemove).toHaveBeenCalledWith(sensorToDelete);
  });

  it("T5.2: delete sensor: not found", async () => {
    mockFind.mockResolvedValue([]);

    await expect(repo.deleteSensor("00:00:00:00:00:00")).rejects.toThrow(
      NotFoundError
    );
  });
});
