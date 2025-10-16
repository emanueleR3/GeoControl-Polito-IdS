import { Measurement as MeasurementDTO } from "@dto/Measurement";
import { Measurements as MeasurementsDTO } from "@dto/Measurements";
import { Stats as StatsDTO } from "@dto/Stats";
import { MeasurementRepository } from "@repositories/MeasurementRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import {
  mapMeasurementDAOToDTO,
  calculateStatsDTO,
  flagMeasurementsDTOoutliers,
  createMeasurementsDTO,
  mapMeasurementsDAOToDTO,
} from "@services/measurementService";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { parseISODateParamToUTC } from "@utils";
import { NotFoundError } from "@models/errors/NotFoundError";

// Get measurements for a set of sensors in a network
export async function getNetworkMeasurements(
  networkCode: string,
  startDate?: string,
  endDate?: string,
  sensorMacs?: string[]
): Promise<MeasurementsDTO[]> {
  const networkRepo = new NetworkRepository();

  // Convert date parameters if provided
  const startDateConverted: Date = parseISODateParamToUTC(startDate);
  const endDateConverted: Date = parseISODateParamToUTC(endDate);

  // Check if network exists
  const network = await networkRepo.getNetworkByCode(networkCode);

  // Get measurements grouped by MAC address
  const measurementsDTO = await getGroupedMeasurementsByMac(
    network,
    sensorMacs,
    startDateConverted,
    endDateConverted
  );

  measurementsDTO.map(
    (e) =>
      (e.stats = calculateStatsDTO(
        e.measurements,
        startDateConverted,
        endDateConverted
      ))
  );

  return measurementsDTO;
}

// Get statistics for a set of sensors in a network
export async function getNetworkStats(
  networkCode: string,
  sensorMacs?: string[],
  startDate?: string,
  endDate?: string
): Promise<MeasurementsDTO[]> {
  return (
    await getNetworkMeasurements(networkCode, startDate, endDate, sensorMacs)
  ).map((e) => createMeasurementsDTO(e.sensorMacAddress, undefined, e.stats));
}

// Get outliers for a set of sensors in a network
export async function getNetworkOutliers(
  networkCode: string,
  sensorMacs?: string[],
  startDate?: string,
  endDate?: string
): Promise<MeasurementsDTO[]> {
  const measurements = await getNetworkMeasurements(
    networkCode,
    startDate,
    endDate,
    sensorMacs
  );
  measurements.forEach((element) => {
    element.measurements = flagMeasurementsDTOoutliers(
      element.measurements,
      element.stats
    ).filter((measure) => measure.isOutlier);
  });
  return measurements;
}

// Store measurements for a sensor
export async function createSensorMeasurement(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  createdAt: Date,
  value: number
): Promise<void> {
  const networkRepo = new NetworkRepository();
  const measurementRepo = new MeasurementRepository();

  // Check if network exists
  const network = await networkRepo.getNetworkByCode(networkCode);

  // Find gateway and sensor from the network's eager loaded data
  const gateway = network.gateways.find((g) => g.macAddress === gatewayMac);
  if (!gateway) {
    throw new NotFoundError(`Entity not found`);
  }

  const sensor = gateway.sensors.find((s) => s.macAddress === sensorMac);
  if (!sensor) {
    throw new NotFoundError(`Entity not found`);
  }

  // Create the measurement
  await measurementRepo.createMeasurement(createdAt, sensor, gateway, value);
}

// Get measurements for a specific sensor
export async function getSensorMeasurementWithStats(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  startDate?: string,
  endDate?: string
): Promise<MeasurementsDTO> {
  const networkRepo = new NetworkRepository();

  // Check if network exists
  const network = await networkRepo.getNetworkByCode(networkCode);

  // Convert date parameters if provided
  const startDateConverted: Date = parseISODateParamToUTC(startDate);
  const endDateConverted: Date = parseISODateParamToUTC(endDate);

  // Get measurements using the helper function
  const measurementArrayDTO = (
    await getRawSensorMeasurements(
      network,
      gatewayMac,
      sensorMac,
      startDateConverted,
      endDateConverted
    )
  ).map((measurement) => mapMeasurementDAOToDTO(measurement));

  const statsDTO: StatsDTO = calculateStatsDTO(
    measurementArrayDTO,
    startDateConverted,
    endDateConverted
  );

  // Map to DTOs and return
  return createMeasurementsDTO(sensorMac, measurementArrayDTO, statsDTO);
}

// Get statistics for a specific sensor
export async function getSensorStats(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  startDate?: string,
  endDate?: string
): Promise<StatsDTO> {
  // Reuse the existing function to get measurements with stats and outliers
  const result = await getSensorMeasurementWithStats(
    networkCode,
    gatewayMac,
    sensorMac,
    startDate,
    endDate
  );

  // Return only the outliers from the measurements
  return result.stats;
}

// Get outliers for a specific sensor
export async function getSensorOutliers(
  networkCode: string,
  gatewayMac: string,
  sensorMac: string,
  startDate?: string,
  endDate?: string
): Promise<MeasurementsDTO> {
  // Reuse the existing function to get measurements with stats and outliers
  const result = await getSensorMeasurementWithStats(
    networkCode,
    gatewayMac,
    sensorMac,
    startDate,
    endDate
  );

  result.measurements = flagMeasurementsDTOoutliers(
    result.measurements,
    result.stats
  ).filter((e) => e.isOutlier);

  // Return only the outliers from the measurements
  return result;
}

//utility method
async function getRawSensorMeasurements(
  network: NetworkDAO,
  gatewayMac: string,
  sensorMac: string,
  startDate?: Date,
  endDate?: Date
): Promise<MeasurementDAO[]> {
  const measurementRepo = new MeasurementRepository();
  // Find gateway and sensor from the network's eager loaded data

  const gateway = network.gateways.find((g) => g.macAddress === gatewayMac);
  if (!gateway) {
    throw new NotFoundError(`Gateway ${gatewayMac} not found`);
  }

  const sensor = gateway.sensors.find((s) => s.macAddress === sensorMac);
  if (!sensor) {
    throw new NotFoundError(`Sensor ${sensorMac} not found`);
  }

  // Get measurements
  const result = await measurementRepo.getMeasurementsByGatewayAndSensor(
    gateway,
    sensor,
    startDate,
    endDate
  );

  return result;
}

// Utility function to get measurements grouped by MAC address as MeasurementsDTO
async function getGroupedMeasurementsByMac(
  network: NetworkDAO,
  sensorMacs?: string[],
  startDate?: Date,
  endDate?: Date
): Promise<MeasurementsDTO[]> {
  const measurementRepo = new MeasurementRepository();
  const gateways = network.gateways;

  // Ricava la lista dei sensori effettivamente presenti nel network (filtrati se richiesto)
  let allSensors = gateways.flatMap((g) => g.sensors);
  if (sensorMacs && sensorMacs.length > 0) {
    allSensors = allSensors.filter((s) => sensorMacs.includes(s.macAddress));
  }
  const sensorMacSet = new Set(allSensors.map((s) => s.macAddress));

  // Prendi tutte le misurazioni dei gateway del network, filtrando per i sensori richiesti
  const allMeasurementArrayDAO =
    await measurementRepo.getMeasurementsByGatewaysAndSensors(
      gateways,
      Array.from(sensorMacSet),
      startDate,
      endDate
    );
  // Raggruppa per macAddress del sensore
  const grouped = allMeasurementArrayDAO.reduce(
    (acc, m) => {
      const mac = m.sensorMacAddress;
      if (!acc[mac]) acc[mac] = [];
      acc[mac].push(m);
      return acc;
    },
    {} as Record<string, MeasurementDAO[]>
  );

  // garantire che ci siano array vuoti nel caso di misure non presenti
  sensorMacSet.forEach((mac) => {
    if (!grouped[mac]) {
      grouped[mac] = [];
    }
  });

  // Crea DTO per ogni gruppo
  return Object.entries(grouped).map(([mac, measures]) => {
    const measurementsDTO = mapMeasurementsDAOToDTO(measures);
    return createMeasurementsDTO(mac, measurementsDTO);
  });
}
