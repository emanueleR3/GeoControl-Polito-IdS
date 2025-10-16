import { Entity, PrimaryColumn, Column } from "typeorm";
import { UserType } from "@models/UserType";

@Entity("users")
export class UserDAO {
  @PrimaryColumn()
  username!: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  type: UserType;
}
