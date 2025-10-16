import {
  initializeTestDataSource,
  closeTestDataSource
} from "@test/setup/test-datasource";
import { UserRepository } from "@repositories/UserRepository";
import { UserType } from "@models/UserType";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { SensorRepository } from "@repositories/SensorRepository";
import { MeasurementRepository } from "@repositories/MeasurementRepository";

export const TEST_USERS = {
  admin: { username: "admin", password: "adminpass", type: UserType.Admin },
  operator: {
    username: "operator",
    password: "operatorpass",
    type: UserType.Operator
  },
  viewer: { username: "viewer", password: "viewerpass", type: UserType.Viewer }
};

export const TEST_NETWORKS = [
  { code: "NET01", 
    name: "network1",
    description: "description1",
  },
  { code: "NET02", 
    name: "network2",
    description: "description2",
  },
  { code: "NET03", 
    name: "network3",
    description: "description3",
  }
];

export const TEST_GATEWAYS = [
  { macAddress: "00:00:00:00:00:01",
    name: "gateway1",
    description: "description1",
    network: TEST_NETWORKS[0].code
  },
  { macAddress: "00:00:00:00:00:02",
    name: "gateway2",
    description: "description2",
    network: TEST_NETWORKS[1].code
  },
  { macAddress: "00:00:00:00:00:03",
    name: "gateway3",
    description: "description3",
    network: TEST_NETWORKS[2].code
  }
];

export const TEST_SENSORS = [
  { macAddress: "00:00:00:00:00:01",
    name: "sensor1",
    description: "description1",
    variable: "Temperature",
    unit: "Celsius",
    gateway: TEST_GATEWAYS[0]
  },
  { macAddress: "00:00:00:00:00:02",
    name: "sensor2",
    description: "description2",
    variable: "Humidity",
    unit: "Percentage",
    gateway: TEST_GATEWAYS[0]
  },
  { macAddress: "00:00:00:00:00:03",
    name: "sensor3",
    description: "description3",
    variable: "Pressure",
    unit: "Pascal",
    gateway: TEST_GATEWAYS[2]
  }
];

export const TEST_MEASUREMENTS = [
  {
    createdAt: new Date("2023-10-01T12:00:00Z"),
    sensorMacAddress: "00:00:00:00:00:01",
    gatewayMacAddress: "00:00:00:00:00:01",
    sensor: null,
    gateway: null,
    value: 25.5,
  },
  {
    createdAt: new Date("2023-10-01T12:05:00Z"),
    sensorMacAddress: "00:00:00:00:00:01",
    gatewayMacAddress: "00:00:00:00:00:01",
    sensor: null,
    gateway: null,
    value: 60.0,
  },
  {
    createdAt: new Date("2023-10-01T12:10:00Z"),
    sensorMacAddress: "00:00:00:00:00:01",
    gatewayMacAddress: "00:00:00:00:00:01",
    sensor: null,
    gateway: null,
    value: 101325.0,
  },
  {
    createdAt: new Date("2023-10-01T12:15:00Z"),
    sensorMacAddress: "00:00:00:00:00:02",
    gatewayMacAddress: "00:00:00:00:00:01",
    sensor: null,
    gateway: null,
    value: 22.0,
  },
  {
    createdAt: new Date("2023-10-01T12:20:00Z"),
    sensorMacAddress: "00:00:00:00:00:02",
    gatewayMacAddress: "00:00:00:00:00:01",
    sensor: null,
    gateway: null,
    value: 55.0,
  },
  {
    createdAt: new Date("2023-10-01T12:25:00Z"),
    sensorMacAddress: "00:00:00:00:00:03",
    gatewayMacAddress: "00:00:00:00:00:03",
    sensor: null,
    gateway: null,
    value: 101500.0,
  }
];

export async function beforeAllE2e() {
  await initializeTestDataSource();
  const repo = new UserRepository();
  await repo.createUser(
    TEST_USERS.admin.username,
    TEST_USERS.admin.password,
    TEST_USERS.admin.type
  );
  await repo.createUser(
    TEST_USERS.operator.username,
    TEST_USERS.operator.password,
    TEST_USERS.operator.type
  );
  await repo.createUser(
    TEST_USERS.viewer.username,
    TEST_USERS.viewer.password,
    TEST_USERS.viewer.type
  );

  const networkRepo = new NetworkRepository();
  for (const network of TEST_NETWORKS) {
    await networkRepo.createNetwork(network.code, network.name, network.description);
  }

  const gatewayRepo = new GatewayRepository();
  for (const gateway of TEST_GATEWAYS) {
    const net = await networkRepo.getNetworkByCode(gateway.network);
    await gatewayRepo.createGateway(
      gateway.macAddress,
      gateway.name,
      gateway.description,
      net
    );
  }
  const sensorRepo = new SensorRepository();
  for (const sensor of TEST_SENSORS) {
    const gateway = await gatewayRepo.getGatewayByMacAddress(sensor.gateway.macAddress);
    if(!gateway) {
      throw new Error(`Gateway with MAC address ${sensor.gateway.macAddress} not found`);
    }
    await sensorRepo.createSensor(
      sensor.macAddress,
      sensor.name,
      sensor.description,
      sensor.variable,
      sensor.unit,
      gateway
    );
  }

  const measurementRepo = new MeasurementRepository();
  for (const measurement of TEST_MEASUREMENTS) {
    const sensor = await sensorRepo.getSensorByMacAddress(measurement.sensorMacAddress);
    if (!sensor) {
      throw new Error(`Sensor with MAC address ${measurement.sensorMacAddress} not found`);
    }
    const gateway = await gatewayRepo.getGatewayByMacAddress(measurement.gatewayMacAddress);
    if (!gateway) {
      throw new Error(`Gateway with MAC address ${measurement.gatewayMacAddress} not found`);
    }
    await measurementRepo.createMeasurement(
      measurement.createdAt,
      sensor,
      gateway,
      measurement.value
    );

  }

}
export async function afterAllE2e() {
  await closeTestDataSource();
}
