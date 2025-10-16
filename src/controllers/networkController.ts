import { Network as NetworkDTO } from "@models/dto/Network";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { mapNetworkDAOToDTO } from "@services/mapperService";

export async function getAllNetworks(): Promise<NetworkDTO[]> {
  const networkRepo = new NetworkRepository();
  return (await networkRepo.getAllNetworks()).map(mapNetworkDAOToDTO);
}
export async function getNetwork(code: string): Promise<NetworkDTO> {
  const networkRepo = new NetworkRepository();
  return mapNetworkDAOToDTO(await networkRepo.getNetworkByCode(code));
}
export async function createNetwork(networkDTO: NetworkDTO): Promise<void> {
  const networkRepo = new NetworkRepository();
  await networkRepo.createNetwork(
    networkDTO.code,
    networkDTO.name,
    networkDTO.description
  );
}
export async function updateNetwork(
  oldCode: string,
  networkDTO: NetworkDTO
): Promise<void> {
  const networkRepo = new NetworkRepository();
  await networkRepo.updateNetwork(
    oldCode,
    networkDTO.code,
    networkDTO.name,
    networkDTO.description
  );
}
export async function deleteNetwork(code: string): Promise<void> {
  const networkRepo = new NetworkRepository();
  await networkRepo.deleteNetwork(code);
}
