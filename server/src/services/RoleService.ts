
import { AppDataSource } from "../config/database";
import { Role } from "../entities/Role";
import { Permission } from "../entities/Permission";

export const createRole = async (data: {
  name: string;
  description?: string;
  permissionIds: number[];
}) => {
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

  const name = data.name.trim().toLowerCase();

  if (!name) {
    throw new Error("Role name is required");
  }

  const existingRole = await roleRepository.findOne({
    where: { name },
  });

  if (existingRole) {
    throw new Error("Role already exists");
  }

  const permissionIds = [...new Set(data.permissionIds)];

  const permissions = permissionIds.length
    ? await permissionRepository
        .createQueryBuilder("permission")
        .where("permission.id IN (:...ids)", { ids: permissionIds })
        .getMany()
    : [];

  if (permissions.length !== permissionIds.length) {
    throw new Error("One or more permissions are invalid");
  }

  const role = roleRepository.create({
    name,
    description: data.description?.trim() || null,
    isSystem: false,
    permissions,
  });

  return await roleRepository.save(role);
};

export const getAllRoles = async () => {
  const roleRepository = AppDataSource.getRepository(Role);

  return await roleRepository.find({
  relations: {
    permissions: true,
  },
  order: { id: "ASC" },
});
};

export const getAllPermissions = async () => {
  const permissionRepository = AppDataSource.getRepository(Permission);

  return await permissionRepository.find({
    order: {
      module: "ASC",
      name: "ASC",
    },
  });
};

export const updateRole = async (
  id: number,
  data: {
    name?: string;
    description?: string | null;
    permissionIds?: number[];
  }
) => {
  const roleRepository = AppDataSource.getRepository(Role);
  const permissionRepository = AppDataSource.getRepository(Permission);

  const role = await roleRepository.findOne({
  where: { id },
  relations: {
    permissions: true,
    users: true,
  },
});

  if (!role) {
    throw new Error("Role not found");
  }

  if (role.isSystem) {
    throw new Error("System roles cannot be modified");
  }

  if (data.name !== undefined) {
    const name = data.name.trim().toLowerCase();

    if (!name) {
      throw new Error("Role name is required");
    }

    const existingRole = await roleRepository.findOne({
      where: { name },
    });

    if (existingRole && existingRole.id !== id) {
      throw new Error("Role already exists");
    }

    role.name = name;
  }

  if (data.description !== undefined) {
    role.description = data.description?.trim() || null;
  }

  if (data.permissionIds !== undefined) {
    const permissionIds = [...new Set(data.permissionIds)];

    const permissions = permissionIds.length
      ? await permissionRepository
          .createQueryBuilder("permission")
          .where("permission.id IN (:...ids)", { ids: permissionIds })
          .getMany()
      : [];

    if (permissions.length !== permissionIds.length) {
      throw new Error("One or more permissions are invalid");
    }

    role.permissions = permissions;
  }

  return await roleRepository.save(role);
};

export const deleteRole = async (id: number) => {
  const roleRepository = AppDataSource.getRepository(Role);

  const role = await roleRepository.findOne({
  where: { id },
  relations: {
    users: true,
  },
});

  if (!role) {
    throw new Error("Role not found");
  }

  if (role.isSystem) {
    throw new Error("System roles cannot be deleted");
  }

  if (role.users?.length) {
    throw new Error("Cannot delete a role assigned to users");
  }

  await roleRepository.remove(role);

  return true;
};
