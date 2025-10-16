import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { SensorDAO } from "@models/dao/SensorDAO";
import { NetworkDAO } from "@models/dao/NetworkDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

@Entity("gateways")
export class GatewayDAO {
  @PrimaryColumn({ nullable: false })
  macAddress!: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @OneToMany(() => SensorDAO, (sensor) => sensor.gateway, {
    eager: true,
  })
  sensors: SensorDAO[];

  @OneToMany(() => MeasurementDAO, (measurement) => measurement.gateway, {
    eager: false,
  })
  measurements: MeasurementDAO[];

  @ManyToOne(() => NetworkDAO, (network) => network.gateways, {
    eager: false,
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  network: NetworkDAO;
}
