import { NetworkDAO } from "@models/dao/NetworkDAO";
import { Gateway as GatewayDTO } from "@models/dto/Gateway";
import { GatewayRepository } from "@repositories/GatewayRepository";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { mapGatewayDAOToDTO } from "@services/mapperService";

export async function getAllGateways(
  networkCode: string
): Promise<GatewayDTO[]> {
  const gatewayRepo = new GatewayRepository();
  return (await gatewayRepo.getAllGatewaysByNetworkCode(networkCode)).map(
    mapGatewayDAOToDTO
  );
}

export async function getGateway(macAddress: string): Promise<GatewayDTO> {
  const gatewayRepo = new GatewayRepository();
  return mapGatewayDAOToDTO(
    await gatewayRepo.getGatewayByMacAddress(macAddress)
  );
}

export async function createGateway(
  networkCode: string,
  GatewayDTO: GatewayDTO
): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  const networkRepo = new NetworkRepository();
  // Validate network existence before creating gateway. This costs two queries, but allows us to
  // identify and handle specific errors instead of relying on database integrity constraints
  // which would throw generic errors.
  await gatewayRepo.createGateway(
    GatewayDTO.macAddress,
    GatewayDTO.name,
    GatewayDTO.description,
    await networkRepo.getNetworkByCode(networkCode)
  );
}

export async function updateGateway(
  oldMacAddress: string,
  gatewayDTO: GatewayDTO
): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.updateGateway(
    oldMacAddress,
    gatewayDTO.macAddress,
    gatewayDTO.name,
    gatewayDTO.description
  );
}

export async function deleteGateway(macAddress: string): Promise<void> {
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.deleteGateway(macAddress);
}
