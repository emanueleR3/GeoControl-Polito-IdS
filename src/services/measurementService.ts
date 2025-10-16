import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { removeNullAttributes } from "./mapperService";
import { Stats as StatsDTO } from "@models/dto/Stats";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";

function createMeasurementDTO(
  createdAt: Date,
  value: number,
  isOutlier: boolean = false
): MeasurementDTO {
  if (
    createdAt === null ||
    createdAt === undefined ||
    value === null ||
    value === undefined
  ) {
    return {} as MeasurementDTO;
  }
  return removeNullAttributes({
    createdAt,
    value,
    isOutlier,
  }) as MeasurementDTO;
}

export function mapMeasurementDAOToDTO(
  measurementDAO: MeasurementDAO
): MeasurementDTO {
  return createMeasurementDTO(measurementDAO.createdAt, measurementDAO.value);
  // isOutlier not saved in db, calculated runtime
}

export function mapMeasurementsDAOToDTO(
  measurementsDAO: MeasurementDAO[]
): MeasurementDTO[] {
  return measurementsDAO.map((measure) => mapMeasurementDAOToDTO(measure));
}

export function createMeasurementsDTO(
  sensorMacAddress: string,
  measurements?: MeasurementDTO[],
  stats?: StatsDTO
): MeasurementsDTO {
  const result = removeNullAttributes({
    sensorMacAddress,
    measurements,
    stats,
  }) as MeasurementsDTO;

  // Assicurati che measurements sia sempre presente, anche se array vuoto
  if (measurements !== undefined) {
    result.measurements = measurements;
  }

  return result;
}

// Here, the calculation of the average and standard deviation is done in TypeScript, not in the database.
// This is the chosen option because we already have a selected sample of measurements, making it viable.
function calculateStatistics(measurementsDAO: Array<MeasurementDTO>): {
  mean: number;
  variance: number;
  upperThreshold: number;
  lowerThreshold: number;
} {
  if (measurementsDAO.length === 0) {
    return { mean: 0, variance: 0, upperThreshold: 0, lowerThreshold: 0 }; // mean, stdDev, upperThreshold, lowerThreshold
  }

  const filtered = measurementsDAO.filter((g) => Object.keys(g).length > 0);

  // Calculate mean
  const sum = filtered.reduce((acc, measurement) => acc + measurement.value, 0);
  const mean = sum / filtered.length;

  // Calculate standard deviation
  const squaredDiffs = filtered.map((measurement) =>
    Math.pow(measurement.value - mean, 2)
  );
  const variance =
    squaredDiffs.reduce((acc, val) => acc + val, 0) / filtered.length;
  const stdDev = Math.sqrt(variance);

  // Calculate thresholds
  const upperThreshold = mean + 2 * stdDev;
  const lowerThreshold = mean - 2 * stdDev;

  return { mean, variance, upperThreshold, lowerThreshold };
}

export function calculateStatsDTO(
  measurementsDTO: Array<MeasurementDTO>,
  startDate?: Date,
  endDate?: Date
): StatsDTO {
  return removeNullAttributes({
    startDate,
    endDate,
    ...calculateStatistics(measurementsDTO),
  }) as StatsDTO;
}

export function flagMeasurementsDTOoutliers(
  measurements: MeasurementDTO[],
  stats: StatsDTO
): MeasurementDTO[] {
  if (!Array.isArray(measurements) || measurements.length === 0) {
    return [];
  }
  // Modifica direttamente ogni elemento dell'array
  measurements.forEach((measurement) => {
    const isOutlier =
      measurement.value > stats.upperThreshold ||
      measurement.value < stats.lowerThreshold;
    measurement.isOutlier = isOutlier;
  });

  return measurements;
}
