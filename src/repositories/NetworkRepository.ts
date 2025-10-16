import { AppDataSource } from "@database";
import { Repository } from "typeorm";
import { findOrThrowNotFound, throwConflictIfFound } from "@utils";
import { NetworkDAO } from "@dao/NetworkDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { Gateway } from "@models/dto/Gateway";

export class NetworkRepository {
  private repo: Repository<NetworkDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(NetworkDAO);
  }

  getAllNetworks(): Promise<NetworkDAO[]> {
    return this.repo.find({ relations: ["gateways"] });
  }

  async createNetwork(
    code: string,
    name: string,
    description: string
  ): Promise<NetworkDAO> {
    throwConflictIfFound(
      await this.repo.find({ where: { code } }),
      () => true,
      `Network with code '${code}' already exists`
    );

    return this.repo.save({
      code: code,
      name: name,
      description: description,
    });
  }

  async getNetworkByCode(code: string): Promise<NetworkDAO> {
    return findOrThrowNotFound(
      await this.repo.find({ where: { code }, relations: ["gateways"] }),
      () => true,
      `Network with code '${code}' not found`
    );
  }
  async updateNetwork(
    oldCode: string,
    newCode: string,
    name: string,
    description: string
  ): Promise<NetworkDAO> {
    const network = await this.getNetworkByCode(oldCode);

    if (oldCode !== newCode) {
      throwConflictIfFound(
        await this.repo.find({ where: { code: newCode } }),
        () => true,
        `Network with code '${newCode}' already exists`
      );
    }

    await this.repo.update(
      { code: oldCode },
      {
        code: newCode,
        name: name,
        description: description,
      }
    );

    return this.getNetworkByCode(newCode);
  }

  async deleteNetwork(code: string): Promise<void> {
    await this.repo.remove(await this.getNetworkByCode(code));
  }
}
