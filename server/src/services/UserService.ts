
import bcrypt from "bcrypt";
import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { User, UserRole, UserStatus } from "../entities/User";
import { Role } from "../entities/Role";

// Resolve role IDs and always include the user's primary system role.
const resolveUserRoles = async (
  roleIds: number[],
  primaryRole: UserRole
) => {
  const roleRepository = AppDataSource.getRepository(Role);

  const uniqueIds = [...new Set(roleIds)];

  const assignedRoles = uniqueIds.length
    ? await roleRepository.find({
        where: { id: In(uniqueIds) },
      })
    : [];

  if (assignedRoles.length !== uniqueIds.length) {
    throw new Error("One or more role IDs are invalid");
  }

  const primarySystemRole = await roleRepository.findOne({
    where: { name: primaryRole },
  });

  if (!primarySystemRole) {
    throw new Error("Primary system role not found");
  }

  if (!assignedRoles.some((role) => role.id === primarySystemRole.id)) {
    assignedRoles.push(primarySystemRole);
  }

  return assignedRoles;
};

export const createUser = async (data: {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: UserRole;
  profileImage?: string;
  roleIds?: number[];
}) => {
  const userRepository = AppDataSource.getRepository(User);

  const existingUser = await userRepository.findOneBy({
    email: data.email,
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const roles = await resolveUserRoles(
    data.roleIds ?? [],
    data.role
  );

  const user = userRepository.create({
    fullName: data.fullName,
    email: data.email,
    mobileNumber: data.mobileNumber,
    password: hashedPassword,
    role: data.role,
    profileImage: data.profileImage,
    status: UserStatus.ACTIVE,
    roles,
  });

  return await userRepository.save(user);
};

export const getAllUsers = async (filters?: {
  search?: string;
  role?: string;
  status?: UserStatus;
}) => {
  const userRepository = AppDataSource.getRepository(User);

  const query = userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.roles", "role")
    .orderBy("user.createdAt", "DESC");

  if (filters?.search) {
    query.andWhere(
      "(user.fullName LIKE :search OR user.email LIKE :search)",
      { search: `%${filters.search}%` }
    );
  }

  if (filters?.role) {
    query.andWhere("role.name = :role", {
      role: filters.role,
    });
  }

  if (filters?.status) {
    query.andWhere("user.status = :status", {
      status: filters.status,
    });
  }

  return await query.getMany();
};

export const updateUser = async (
  id: number,
  data: {
    fullName?: string;
    email?: string;
    mobileNumber?: string;
    role?: UserRole;
    profileImage?: string | null;
    roleIds?: number[];
  }
) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id },
    relations: {
      roles: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (data.email && data.email !== user.email) {
    const existingUser = await userRepository.findOneBy({
      email: data.email,
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }
  }

  const { roleIds, ...userData } = data;

  const primaryRole = data.role ?? user.role;

  if (roleIds !== undefined) {
    user.roles = await resolveUserRoles(roleIds, primaryRole);
  } else if (data.role !== undefined && data.role !== user.role) {
    // Preserve additional roles while replacing the previous primary system role.
    const remainingRoles = (user.roles ?? []).filter(
      (role) => role.name !== user.role
    );

    user.roles = await resolveUserRoles(
      remainingRoles.map((role) => role.id),
      primaryRole
    );
  }

  Object.assign(user, userData);

  return await userRepository.save(user);
};

export const deactivateUser = async (id: number) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOneBy({ id });

  if (!user) {
    throw new Error("User not found");
  }

  user.status = UserStatus.INACTIVE;

  return await userRepository.save(user);
};

export const activateUser = async (id: number) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  user.status = UserStatus.ACTIVE;

  return await userRepository.save(user);
};
