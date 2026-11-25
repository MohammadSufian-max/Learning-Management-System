import bcrypt from "bcrypt";
import { AppDataSource } from "../config/database";
import { User, UserRole, UserStatus } from "../entities/User";

export const createUser = async (data: {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: UserRole;
  profileImage?: string;
}) => {
  const userRepository = AppDataSource.getRepository(User);

  const existingUser = await userRepository.findOneBy({
    email: data.email,
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = userRepository.create({
    ...data,
    password: hashedPassword,
    status: UserStatus.ACTIVE,
  });

  return await userRepository.save(user);
};


export const getAllUsers = async (filters?: {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}) => {
  const userRepository = AppDataSource.getRepository(User);

  const query = userRepository
    .createQueryBuilder("user")
    .orderBy("user.createdAt", "DESC");

  if (filters?.search) {
    query.andWhere(
      "(user.fullName LIKE :search OR user.email LIKE :search)",
      { search: `%${filters.search}%` }
    );
  }

  if (filters?.role) {
    query.andWhere("user.role = :role", {
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
  }
) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOneBy({ id });

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

  Object.assign(user, data);

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