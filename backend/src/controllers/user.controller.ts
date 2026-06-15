import { Request, Response } from "express";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { hashPassword } from "../utils/password";

function serialize(u: any) {
  const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  return {
    id: String(u._id),
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    name,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role ? { id: String(u.role._id), name: u.role.name } : null,
    isActive: u.isActive,
    isSystem: u.isSystem ?? false,
    lastLogin: u.lastLogin ?? null,
    createdAt: u.createdAt,
  };
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find()
    .populate("role", "name")
    .sort({ createdAt: -1 });
  res.json({ users: users.map(serialize) });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id).populate("role", "name");
  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }
  res.json({ user: serialize(user) });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { firstName, lastName, email, phone, password, roleId } = req.body ?? {};
  if (!firstName || !email || !password || !roleId) {
    res.status(400).json({
      message: "Faltan campos (firstName, email, password, roleId)",
    });
    return;
  }
  const normalizedEmail = String(email).toLowerCase();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    res.status(409).json({ message: "El email ya está registrado" });
    return;
  }
  const role = await Role.findById(roleId);
  if (!role) {
    res.status(400).json({ message: "Rol inválido" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    firstName,
    lastName: lastName ?? "",
    email: normalizedEmail,
    phone: phone ?? "",
    passwordHash,
    role: role._id,
  });
  await user.populate("role", "name");
  res.status(201).json({ user: serialize(user) });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { firstName, lastName, phone, email, roleId, isActive, password } =
    req.body ?? {};
  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  // Protecciones de la cuenta de administrador del sistema.
  if (user.isSystem) {
    if (roleId && String(roleId) !== String(user.role)) {
      res.status(403).json({
        message: "No se puede cambiar el rol del administrador del sistema.",
      });
      return;
    }
    if (
      email !== undefined &&
      String(email).toLowerCase().trim() !== user.email
    ) {
      res.status(403).json({
        message: "No se puede cambiar el correo del administrador del sistema.",
      });
      return;
    }
    if (isActive === false) {
      res.status(403).json({
        message: "No se puede desactivar al administrador del sistema.",
      });
      return;
    }
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;
  if (email !== undefined) {
    const normalized = String(email).toLowerCase().trim();
    if (normalized !== user.email) {
      const exists = await User.findOne({
        email: normalized,
        _id: { $ne: user._id },
      });
      if (exists) {
        res.status(409).json({ message: "El email ya está registrado" });
        return;
      }
      user.email = normalized;
    }
  }
  if (roleId) {
    const role = await Role.findById(roleId);
    if (!role) {
      res.status(400).json({ message: "Rol inválido" });
      return;
    }
    user.role = role._id as any;
  }
  if (password) user.passwordHash = await hashPassword(password);
  await user.save();
  await user.populate("role", "name");
  res.json({ user: serialize(user) });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (req.user?.id === id) {
    res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
    return;
  }
  const target = await User.findById(id);
  if (!target) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }
  if (target.isSystem) {
    res.status(403).json({
      message: "No se puede eliminar la cuenta de administrador del sistema.",
    });
    return;
  }
  await target.deleteOne();
  res.json({ ok: true });
}
