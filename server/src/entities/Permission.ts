import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from "typeorm";

import { Role } from "./Role";

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn({ type: "int" })
  id!: number;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  module!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  description!: string | null;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;
}