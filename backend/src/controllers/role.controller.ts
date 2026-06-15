import { Request, Response } from "express";
import { Role } from "../models/Role";

export async function listRoles(_req: Request, res: Response): Promise<void> {
  const roles = await Role.find().sort({ name: 1 });
  res.json({
    roles: roles.map((r) => ({
      id: String(r._id),
      name: r.name,
      description: r.description ?? null,
      permissions: r.permissions,
    })),
  });
}
