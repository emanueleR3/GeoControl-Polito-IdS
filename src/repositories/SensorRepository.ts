import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { SensorDAO } from "@dao/SensorDAO";
import { GatewayDAO } from "@dao/GatewayDAO";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";

export class SensorRepository {
  private repo: Repository<SensorDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(SensorDAO);
  }

  getAllSensors(): Promise<SensorDAO[]> {
    return this.repo.find();
  }

  async getSensorByMacAddress(macAddress: string): Promise<SensorDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Sensor with MAC address '${macAddress}' not found`
    );
  }

  async createSensor(
    macAddress: string,
    name: string,
    description: string,
    variable: string,
    unit: string,
    gateway: GatewayDAO
  ): Promise<SensorDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Sensor with MAC address '${macAddress}' already exists`
    );

    return this.repo.save({
      macAddress,
      name,
      description,
      variable,
      unit,
      gateway,
    });
  }

  async updateSensor(
    oldMac: string,
    newMac: string,
    name: string,
    description: string,
    variable: string,
    unit: string
  ): Promise<SensorDAO> {
    const sensorToUpdate = await this.getSensorByMacAddress(oldMac);

    if (oldMac !== newMac) {
      throwConflictIfFound(
        await this.repo.find({ where: { macAddress: newMac } }),
        () => true,
        `Sensor with MAC Address '${newMac}' already exists`
      );
    }

    await this.repo.update(
      { macAddress: oldMac },
      {
        macAddress: newMac,
        name: name,
        description: description,
        variable: variable,
        unit: unit,
      }
    );

    return this.getSensorByMacAddress(newMac);
  }

  async deleteSensor(macAddress: string): Promise<void> {
    await this.repo.remove(await this.getSensorByMacAddress(macAddress));
  }

  async getSensorsByGateway(gatewayMac: string): Promise<SensorDAO[]> {
    const gateway = findOrThrowNotFound(
      [
        await AppDataSource.getRepository(GatewayDAO).findOne({
          where: { macAddress: gatewayMac },
          relations: ["sensors"],
        }),
      ],
      (g) => g !== null,
      `Gateway with MAC address '${gatewayMac}' not found`
    );

    console.log(
      `Found ${gateway.sensors.length} sensors for gateway ${gatewayMac}`
    );
    return gateway.sensors;
  }
}
