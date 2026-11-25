
import "reflect-metadata";
import "dotenv/config";

import bcrypt from "bcrypt";
import { AppDataSource } from "../config/database";
import { User, UserRole, UserStatus } from "../entities/User";

const seedAdmin = async () => {
  try {
    const fullName = process.env.ADMIN_FULL_NAME;
    const email = process.env.ADMIN_EMAIL;
    const mobileNumber = process.env.ADMIN_MOBILE;
    const password = process.env.ADMIN_PASSWORD;

    if (!fullName || !email || !mobileNumber || !password) {
      throw new Error("Admin environment variables are missing");
    }

    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

    const existingAdmin = await userRepository.findOneBy({
      email,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = userRepository.create({
      fullName,
      email,
      mobileNumber,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    await userRepository.save(admin);

    console.log("Initial Admin account created successfully!");
  } catch (error) {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

seedAdmin();
