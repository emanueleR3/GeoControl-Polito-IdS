import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { SensorDAO } from "@models/dao/SensorDAO";
import { GatewayDAO } from "@models/dao/GatewayDAO";

@Entity("measurements")
export class MeasurementDAO {
  @PrimaryColumn({ type: "datetime" })
  createdAt!: Date;

  @PrimaryColumn({ type: "text", name: "sensorMacAddress" })
  sensorMacAddress!: string;

  @Column({ type: "text", name: "gatewayMacAddress" })
  gatewayMacAddress!: string;

  @ManyToOne(() => SensorDAO, {
    eager: false,
    createForeignKeyConstraints: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "sensorMacAddress",
    referencedColumnName: "macAddress",
  })
  sensor!: SensorDAO;

  @ManyToOne(() => GatewayDAO, {
    eager: false,
    createForeignKeyConstraints: true,
    onUpdate: "CASCADE",
  })
  @JoinColumn({
    name: "gatewayMacAddress",
    referencedColumnName: "macAddress",
  })
  gateway!: GatewayDAO;

  @Column({ type: "real", nullable: false })
  value!: number;

  // Outlier not here but in dto because calculated runtime
}
