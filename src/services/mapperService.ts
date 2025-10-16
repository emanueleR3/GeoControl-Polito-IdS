import { Token as TokenDTO } from "@dto/Token";
import { User as UserDTO } from "@dto/User";
import { UserDAO } from "@models/dao/UserDAO";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { SensorDAO } from "@models/dao/SensorDAO";
import { ErrorDTO } from "@models/dto/ErrorDTO";
import { UserType } from "@models/UserType";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { Network as NetworkDTO } from "@dto/Network";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { GatewayDAO } from "@models/dao/GatewayDAO";

export function createErrorDTO(
  code: number,
  message?: string,
  name?: string
): ErrorDTO {
  return removeNullAttributes({
    code,
    name,
    message,
  }) as ErrorDTO;
}

export function createTokenDTO(token: string): TokenDTO {
  return removeNullAttributes({
    token: token,
  }) as TokenDTO;
}

export function createUserDTO(
  username: string,
  type: UserType,
  password?: string
): UserDTO {
  return removeNullAttributes({
    username,
    type,
    password,
  }) as UserDTO;
}

export function createSensorDTO(
  macAddress: string,
  name: string,
  description: string,
  variable: string,
  unit: string
): SensorDTO {
  return removeNullAttributes({
    macAddress,
    name,
    description,
    variable,
    unit,
  }) as SensorDTO;
}

export function mapUserDAOToDTO(userDAO: UserDAO): UserDTO {
  return createUserDTO(userDAO.username, userDAO.type);
}

export function mapSensorDAOToDTO(sensorDAO: SensorDAO): SensorDTO {
  return createSensorDTO(
    sensorDAO.macAddress,
    sensorDAO.name,
    sensorDAO.description,
    sensorDAO.variable,
    sensorDAO.unit
  );
}

export function removeNullAttributes<T>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as Partial<T>;
}
export function mapNetworkDAOToDTO(networkDAO: NetworkDAO): NetworkDTO {
  return removeNullAttributes({
    code: networkDAO.code,
    name: networkDAO.name,
    description: networkDAO.description,
    gateways: networkDAO.gateways,
  }) as NetworkDTO;
}

export function mapGatewayDAOToDTO(gatewayDAO: GatewayDAO): GatewayDTO {
  return removeNullAttributes({
    macAddress: gatewayDAO.macAddress,
    name: gatewayDAO.name,
    description: gatewayDAO.description,
    network: gatewayDAO.network,
    sensors: gatewayDAO.sensors,
  }) as GatewayDTO;
}
