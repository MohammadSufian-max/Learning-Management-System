
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { ManyToMany, JoinTable } from "typeorm";
import { Role } from "./Role";

export enum UserRole {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  STUDENT = "student",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ type: "int" })
  id!: number;

  @Column({
    name: "full_name",
    type: "varchar",
    length: 150,
  })
  fullName!: string;

  @Column({
    type: "varchar",
    length: 150,
    unique: true,
  })
  email!: string;

  @Column({
    name: "mobile_number",
    type: "varchar",
    length: 20,
  })
  mobileNumber!: string;

  @Column({
    type: "varchar",
    select: false,
  })
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @ManyToMany(() => Role, (role) => role.users)
@JoinTable({
  name: "user_roles",
  joinColumn: { name: "user_id", referencedColumnName: "id" },
  inverseJoinColumn: { name: "role_id", referencedColumnName: "id" },
})
roles!: Role[];

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Column({
    name: "profile_image",
    type: "varchar",
    nullable: true,
  })
  profileImage!: string | null;

  @CreateDateColumn({
    name: "created_at",
    type: "datetime",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "datetime",
  })
  updatedAt!: Date;
}
