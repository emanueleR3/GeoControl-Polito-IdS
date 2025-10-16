import { AppDataSource } from "@database";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";
import { SensorDAO } from "@models/dao/SensorDAO";
import { ConflictError } from "@models/errors/ConflictError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import {
  Between,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";

export class MeasurementRepository {
  private repo: Repository<MeasurementDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(MeasurementDAO);
  }

  async getMeasurementsByGatewayAndSensor(
    gateway: GatewayDAO,
    sensor: SensorDAO,
    startDate?: Date,
    endDate?: Date
  ): Promise<MeasurementDAO[]> {
    if (!sensor.macAddress || !gateway.macAddress) {
      throw new NotFoundError("Gateway or sensor MAC address is missing");
    }
    const where: any = {
      sensor: sensor,
      gateway: gateway,
    };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    const measurements = await this.repo.find({
      where,
    });

    return measurements;
  }

  async getMeasurementsByGatewaysAndSensors(
    gateways: GatewayDAO[],
    sensorMacAddresses?: string[],
    startDate?: Date,
    endDate?: Date
  ): Promise<MeasurementDAO[]> {
    if (!gateways.length) return [];
    const gatewayMacs = gateways.filter((g) => g).map((g) => g.macAddress);

    const where: any = {
      gatewayMacAddress: In(gatewayMacs),
    };

    if (sensorMacAddresses?.length > 0) {
      sensorMacAddresses = sensorMacAddresses.filter((s) => s);
      if (sensorMacAddresses.length > 0)
        where.sensorMacAddress = In(sensorMacAddresses);
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    const measurements = await this.repo.find({ where });

    return measurements;
  }

  // does not overwrite the measurement with the value if already exists
  async createMeasurement(
    createdAt: Date,
    sensor: SensorDAO,
    gateway: GatewayDAO,
    value: number
  ): Promise<MeasurementDAO> {
    if (!sensor.macAddress || !gateway.macAddress) {
      throw new NotFoundError("Gateway or sensor MAC address is missing");
    }

    // Check for existing measurement using the utility function
    const existingMeasurements = await this.repo.find({
      where: {
        createdAt: createdAt,
        sensorMacAddress: sensor.macAddress,
      },
    });

    throwConflictIfFound(
      existingMeasurements,
      (measurement) => measurement.createdAt.getTime() === createdAt.getTime(),
      "Measurement already exists for this sensor at the specified time"
    );

    // Create new measurement
    const measurement = new MeasurementDAO();
    measurement.createdAt = createdAt;
    measurement.sensorMacAddress = sensor.macAddress;
    measurement.gatewayMacAddress = gateway.macAddress;
    measurement.value = value;
    measurement.sensor = sensor;
    measurement.gateway = gateway;

    // Save to database
    const savedMeasurement = await this.repo.save(measurement);
    return savedMeasurement;
  }
}
