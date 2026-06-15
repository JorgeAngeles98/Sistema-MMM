import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";
import { IRole } from "../models/Role";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

// Extiende Express.Request para incluir el usuario autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Verifica el JWT del header Authorization y carga el usuario + permisos frescos desde la BD.
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "No autenticado" });
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    const user = await User.findById(payload.sub).populate("role");
    if (!user || !user.isActive) {
      res.status(401).json({ message: "Usuario inválido o inactivo" });
      return;
    }
    const role = user.role as unknown as IRole;
    req.user = {
      id: String(user._id),
      name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
      email: user.email,
      role: role.name,
      permissions: role.permissions,
    };
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Exige que el usuario tenga un permiso específico.
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "No autenticado" });
      return;
    }
    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({ message: "Permiso denegado" });
      return;
    }
    next();
  };
}
