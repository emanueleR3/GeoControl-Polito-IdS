/**
 * @fileoverview Unit tests for Measurement Service
 *
 * @description
 * This file contains unit tests for measurement service functions.
 * Tests are organized by function groups and follow the naming convention Tx.y
 * where x represents the function group and y represents the test number within that group.
 *
 * @testNamingConvention
 * T1.x - mapMeasurementDAOToDTO (Map single measurement DAO to DTO)
 *   T1.1 - Map MeasurementDAO to MeasurementDTO correctly
 *   T1.2 - Handle null/undefined values in mapping
 *
 * T2.x - mapMeasurementsDAOToDTO (Map multiple measurements DAO to DTO)
 *   T2.1 - Map multiple MeasurementDAO to MeasurementDTO array
 *   T2.2 - Handle empty array mapping
 *
 * T3.x - createMeasurementsDTO (Create measurements DTO structure)
 *   T3.1 - Create MeasurementsDTO with provided data
 *   T3.2 - Create MeasurementsDTO with only required fields
 *
 * T4.x - calculateStatsDTO (Calculate statistics for measurements)
 *   T4.1 - Calculate statistics correctly
 *   T4.2 - Handle empty measurements array for statistics
 *   T4.3 - Handle measurements with null values when calculating statistics
 *
 * T5.x - flagMeasurementsDTOoutliers (Flag outlier measurements)
 *   T5.1 - Flag outliers correctly
 *   T5.2 - Handle empty array when flagging outliers
 *
 * @totalTests 13
 * @coverage All measurement service functions with edge cases and error handling
 */

import {
  mapMeasurementDAOToDTO,
  mapMeasurementsDAOToDTO,
  createMeasurementsDTO,
  calculateStatsDTO,
  flagMeasurementsDTOoutliers,
} from "../../../src/services/measurementService";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { SensorDAO } from "@models/dao/SensorDAO";
import { SensorFromJSON, SensorFromJSONTyped } from "@models/dto/Sensor";
import { GatewayDAO } from "@models/dao/GatewayDAO";

describe("Measurement Service", () => {
  const testSensorDAO = {
    macAddress: "00:11:22:33:44:55",
    name: "Temperature Sensor",
    description: "Measures temperature in Celsius",
    variable: "temperature",
    unit: "Celsius",
  } as SensorDAO;

  const testGatewayDAO = {
    macAddress: "AA:BB:CC:DD:EE:FF",
    name: "Main Gateway",
    description: "Handles sensor data",
    sensors: [testSensorDAO],
  } as GatewayDAO;

  testSensorDAO.gateway = testGatewayDAO;

  const testMeasuresArrayDAO = [
    {
      createdAt: new Date("2025-05-18T10:00:00Z"),
      sensorMacAddress: "00:11:22:33:44:55",
      gatewayMacAddress: "AA:BB:CC:DD:EE:FF",
      value: 0,
    },
    {
      createdAt: new Date("2025-05-18T11:00:00Z"),
      sensorMacAddress: "00:11:22:33:44:55",
      gatewayMacAddress: "AA:BB:CC:DD:EE:FF",
      value: 5,
    },
    {
      createdAt: new Date("2025-05-18T12:00:00Z"),
      sensorMacAddress: "00:11:22:33:44:55",
      gatewayMacAddress: "AA:BB:CC:DD:EE:FF",
      value: 10,
    },
  ] as MeasurementDAO[];

  const testMeasuresArrayResultDTO = [
    {
      createdAt: testMeasuresArrayDAO[0].createdAt,
      value: 0,
      isOutlier: false,
    },
    {
      createdAt: testMeasuresArrayDAO[1].createdAt,
      value: 5,
      isOutlier: false,
    },
    {
      createdAt: testMeasuresArrayDAO[2].createdAt,
      value: 10,
      isOutlier: false,
    },
  ] as MeasurementDTO[];

  const testMeasure = testMeasuresArrayDAO[0];

  // T1 mapMeasurementDAOToDTO
  test("T1.1 map MeasurementDAO to MeasurementDTO correctly", () => {
    const result = mapMeasurementDAOToDTO(testMeasure);

    // Verify that the result is a MeasurementDTO with only createdAt and value fields
    expect(result).toEqual({
      createdAt: testMeasure.createdAt,
      value: testMeasure.value,
      isOutlier: false,
    });

    // Verify that other fields from the DAO are not present
    expect(result).not.toHaveProperty("sensorMacAddress");
    expect(result).not.toHaveProperty("gatewayMacAddress");
    expect(result).not.toHaveProperty("sensor");
    expect(result).not.toHaveProperty("gateway");
  });

  test("T1.2 mapMeasurementDAOToDTO should not return fields with null values", () => {
    const testMeasure2 = {
      createdAt: undefined,
      value: null,
    } as MeasurementDAO;

    const result = mapMeasurementDAOToDTO(testMeasure2);

    // Check that the result has no createdAt and no value
    expect(result).not.toHaveProperty("value");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("isOutlier");

    // Verify the structure is as expected - only isOutlier should be present
    expect(Object.keys(result).length).toBe(0);
  });

  // T2 mapMeasurementsDAOToDTO
  test("T2.1 should map multiple MeasurementDAO to MeasurementDTO array", () => {
    const result = mapMeasurementsDAOToDTO(testMeasuresArrayDAO);

    expect(result).toEqual(testMeasuresArrayResultDTO);

    // Verify the structure of each mapped object
    result.forEach((dto) => {
      expect(dto).not.toHaveProperty("sensorMacAddress");
      expect(dto).not.toHaveProperty("gatewayMacAddress");
    });
  });

  test("T2.2 should return empty array when no measurements provided", () => {
    const result = mapMeasurementsDAOToDTO([]);
    expect(result).toEqual([]);
  });

  // T3 createMeasurementsDTO
  test("T3.1 should create MeasurementsDTO with provided data", () => {
    const testStats = {
      mean: 5,
      variance: 50 / 3,
      upperThreshold: 5 + 2 * Math.sqrt(50 / 3),
      lowerThreshold: 5 - 2 * Math.sqrt(50 / 3),
    } as StatsDTO;

    const macAddress = testSensorDAO.macAddress;
    const result = createMeasurementsDTO(
      macAddress,
      testMeasuresArrayResultDTO,
      testStats
    );

    expect(result).toEqual({
      sensorMacAddress: macAddress,
      measurements: testMeasuresArrayResultDTO,
      stats: testStats,
    });
  });

  test("T3.2 should create MeasurementsDTO with only required fields", () => {
    const sensorMacAddress = testSensorDAO.macAddress;

    const result = createMeasurementsDTO(sensorMacAddress);

    expect(result).toEqual({ sensorMacAddress });
  });

  // T4 calculateStatsDTO
  test("T4.1 should calculate statistics correctly", () => {
    const measurements: MeasurementDTO[] =
      mapMeasurementsDAOToDTO(testMeasuresArrayDAO);
    const startDate = new Date("2025-05-18T10:00:00Z");
    const endDate = new Date("2025-05-18T12:00:00Z");

    const result = calculateStatsDTO(measurements, startDate, endDate);

    const testStats = {
      mean: 5,
      variance: 50 / 3,
      upperThreshold: 5 + 2 * Math.sqrt(50 / 3),
      lowerThreshold: 5 - 2 * Math.sqrt(50 / 3),
      startDate: startDate,
      endDate: endDate,
    } as StatsDTO;

    expect(result).toEqual(testStats);

    // the function is not in charge to check if measurements are in date range.
  });

  test("T4.2 should handle empty measurements array for statistics", () => {
    const result = calculateStatsDTO([]);

    expect(result.mean).toBe(0);
    expect(result.variance).toBe(0);
    expect(result.upperThreshold).toBe(0);
    expect(result.lowerThreshold).toBe(0);
  });

  test("T4.3 should handle measurements with null values when calculating statistics", () => {
    const measurementsWithNull = [
      {} as MeasurementDTO,
      ...mapMeasurementsDAOToDTO(testMeasuresArrayDAO),
    ];

    // Since the value is undefined, it should be ignored in calculations
    const result = calculateStatsDTO(measurementsWithNull);

    // The results should be the same as with just the valid measurements
    const expectedStats = {
      mean: 5,
      variance: 50 / 3,
      upperThreshold: 5 + 2 * Math.sqrt(50 / 3),
      lowerThreshold: 5 - 2 * Math.sqrt(50 / 3),
    };

    expect(result.mean).toBe(expectedStats.mean);
    expect(result.variance).toBe(expectedStats.variance);
    expect(result.upperThreshold).toBe(expectedStats.upperThreshold);
    expect(result.lowerThreshold).toBe(expectedStats.lowerThreshold);
  });

  // T5 flagMeasurementsDTOoutliers
  test("T5.1 should flag outliers correctly", () => {
    const measurements: MeasurementDTO[] = [
      { createdAt: testMeasuresArrayDAO[0].createdAt, value: 0 }, // normal
      { createdAt: testMeasuresArrayDAO[1].createdAt, value: 5 }, // normal
      { createdAt: testMeasuresArrayDAO[2].createdAt, value: 10 }, // normal
      { createdAt: new Date("2025-05-18T13:00:00Z"), value: -100 }, // outlier
      { createdAt: new Date("2025-05-18T14:00:00Z"), value: 500 }, // outlier
    ];

    const testStats = {
      mean: 5,
      variance: 50 / 3,
      upperThreshold: 5 + 2 * Math.sqrt(50 / 3),
      lowerThreshold: 5 - 2 * Math.sqrt(50 / 3),
    } as StatsDTO;

    const result = flagMeasurementsDTOoutliers(measurements, testStats);

    expect(result[0].isOutlier).toBe(false);
    expect(result[1].isOutlier).toBe(false);
    expect(result[2].isOutlier).toBe(false);
    expect(result[3].isOutlier).toBe(true);
    expect(result[4].isOutlier).toBe(true);
  });

  test("T5.2 should return empty array when no measurements provided", () => {
    const stats: StatsDTO = {
      mean: 2,
      variance: 1,
      upperThreshold: 4,
      lowerThreshold: 0,
    };

    const result = flagMeasurementsDTOoutliers([], stats);

    expect(result).toEqual([]);
  });
});
