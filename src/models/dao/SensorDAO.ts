import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { GatewayDAO } from "@models/dao/GatewayDAO";
import { MeasurementDAO } from "@models/dao/MeasurementDAO";

@Entity("sensors")
export class SensorDAO {
  @PrimaryColumn({ nullable: false })
  macAddress: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  variable: string;

  @Column({ nullable: false })
  unit: string;

  @Column({ type: "varchar", name: "gatewayMacAddress" })
  @ManyToOne(() => GatewayDAO, (gateway) => gateway.sensors, {
    eager: false, // Gateway is not loaded automatically when sensor is loaded
    createForeignKeyConstraints: true, // Enforces referential integrity at database level
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  gateway: GatewayDAO;

  @OneToMany(() => MeasurementDAO, (measurement) => measurement.sensor, {
    eager: false,
  })
  measurements: MeasurementDAO[];
}
