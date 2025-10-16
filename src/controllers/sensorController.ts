import { Sensor as SensorDTO } from "@dto/Sensor";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { mapSensorDAOToDTO } from "@services/mapperService";

export async function getAllSensors(
  gatewayMacAddress: string
): Promise<SensorDTO[]> {
  const sensorRepo = new SensorRepository();
  return (await sensorRepo.getSensorsByGateway(gatewayMacAddress)).map(
    mapSensorDAOToDTO
  );
}

export async function getSensor(macAddress: string): Promise<SensorDTO> {
  const sensorRepo = new SensorRepository();
  return mapSensorDAOToDTO(await sensorRepo.getSensorByMacAddress(macAddress));
}

export async function createSensor(
  gatewayMac: string,
  sensorDto: SensorDTO
): Promise<void> {
  const sensorRepo = new SensorRepository();
  const gatewayRepo = new GatewayRepository();
  // Validate gateway existence before creating sensor. This costs two queries, but allows us to
  // identify and handle specific errors instead of relying on database integrity constraints
  // which would throw generic errors.
  await sensorRepo.createSensor(
    sensorDto.macAddress,
    sensorDto.name,
    sensorDto.description,
    sensorDto.variable,
    sensorDto.unit,
    await gatewayRepo.getGatewayByMacAddress(gatewayMac)
  );
}

export async function updateSensor(
  oldMac: string,
  sensorDto: SensorDTO
): Promise<void> {
  const sensorRepo = new SensorRepository();

  console.log(
    `Updating sensor with old MAC: ${oldMac} to new MAC: ${sensorDto.macAddress}`
  );
  await sensorRepo.updateSensor(
    oldMac,
    sensorDto.macAddress,
    sensorDto.name,
    sensorDto.description,
    sensorDto.variable,
    sensorDto.unit
  );
}

export async function deleteSensor(macAddress: string): Promise<void> {
  const sensorRepo = new SensorRepository();
  await sensorRepo.deleteSensor(macAddress);
}
