import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { IRole } from "../models/Role";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";

// Construye el objeto público del usuario (sin el hash de contraseña).
export function publicUser(u: IUser, role: IRole) {
  const name = `${u.firstName} ${u.lastName ?? ""}`.trim();
  return {
    id: String(u._id),
    firstName: u.firstName,
    lastName: u.lastName ?? "",
    name,
    email: u.email,
    phone: u.phone ?? "",
    role: role.name,
    permissions: role.permissions,
    isActive: u.isActive,
    isSystem: u.isSystem ?? false,
    lastLogin: u.lastLogin ?? null,
    createdAt: (u as unknown as { createdAt?: Date }).createdAt ?? null,
  };
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ message: "Email y contraseña son requeridos" });
    return;
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).populate(
    "role"
  );
  if (!user) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }
  if (!user.isActive) {
    res.status(403).json({ message: "Usuario inactivo" });
    return;
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  user.lastLogin = new Date();
  await user.save();

  const role = user.role as unknown as IRole;
  const token = signToken(String(user._id));
  res.json({ token, user: publicUser(user, role) });
}

export async function me(req: Request, res: Response): Promise<void> {
  const full = await User.findById(req.user!.id).populate("role");
  if (!full) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }
  const role = full.role as unknown as IRole;
  res.json({ user: publicUser(full, role) });
}

// El propio usuario edita sus datos personales.
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { firstName, lastName, phone, email } = req.body ?? {};
  const user = await User.findById(req.user!.id).populate("role");
  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  if (firstName !== undefined) {
    if (!String(firstName).trim()) {
      res.status(400).json({ message: "El nombre es obligatorio" });
      return;
    }
    user.firstName = firstName;
  }
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (email !== undefined) {
    const normalized = String(email).toLowerCase().trim();
    if (normalized !== user.email) {
      if (user.isSystem) {
        res.status(403).json({
          message:
            "No se puede cambiar el correo de la cuenta de administrador del sistema.",
        });
        return;
      }
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

  await user.save();
  const role = user.role as unknown as IRole;
  res.json({ user: publicUser(user, role) });
}

// El propio usuario cambia su contraseña.
export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    res
      .status(400)
      .json({ message: "Debes indicar la contraseña actual y la nueva" });
    return;
  }
  if (String(newPassword).length < 6) {
    res
      .status(400)
      .json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
    return;
  }

  const user = await User.findById(req.user!.id);
  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) {
    res.status(400).json({ message: "La contraseña actual es incorrecta" });
    return;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  res.json({ ok: true });
}
