import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { NotFoundError } from "@models/errors/NotFoundError";

export class GatewayRepository {
  private repo: Repository<GatewayDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(GatewayDAO);
  }

  getAllGateways(): Promise<GatewayDAO[]> {
    return this.repo.find({ relations: ["sensors"] }); // no need to eager loading parent network.
  }

  async createGateway(
    macAddress: string,
    name: string,
    description: string,
    network: NetworkDAO
  ): Promise<GatewayDAO> {
    // Ensure network association is properly maintained in the database
    throwConflictIfFound(
      await this.repo.find({ where: { macAddress } }),
      () => true,
      `Gateway with MAC address '${macAddress}' already exists`
    );

    return this.repo.save({
      macAddress,
      name,
      description,
      network,
    });
  }

  async getGatewayByMacAddress(macAddress: string): Promise<GatewayDAO> {
    return findOrThrowNotFound(
      await this.repo.find({
        where: { macAddress },
        relations: ["sensors", "network"],
      }),
      () => true,
      `Gateway with MAC address '${macAddress}' not found`
    );
  }

  async updateGateway(
    oldMacAddress: string,
    newMacAddress: string,
    name: string,
    description: string
  ): Promise<GatewayDAO> {
    const gateway = await this.getGatewayByMacAddress(oldMacAddress);

    if (oldMacAddress !== newMacAddress) {
      throwConflictIfFound(
        await this.repo.find({ where: { macAddress: newMacAddress } }),
        () => true,
        `Gateway with MAC Address '${newMacAddress}' already exists`
      );
    }

    await this.repo.update(
      { macAddress: oldMacAddress },
      {
        macAddress: newMacAddress,
        name: name,
        description: description,
      }
    );

    return this.getGatewayByMacAddress(newMacAddress);
  }

  async deleteGateway(macAddress: string): Promise<void> {
    await this.repo.remove(await this.getGatewayByMacAddress(macAddress));
  }

  async getAllGatewaysByNetworkCode(
    networkCode: string
  ): Promise<GatewayDAO[]> {
    const network = await AppDataSource.getRepository(NetworkDAO).findOne({
      where: { code: networkCode },
    });

    findOrThrowNotFound(
      [network],
      (n) => n !== null,
      `Network with code '${networkCode}' not found`
    );

    return this.repo.find({
      where: { network: { code: networkCode } },
      relations: ["sensors"],
    });
  }
}
