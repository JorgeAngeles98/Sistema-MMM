import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-cambia-esto";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayload {
  sub: string; // id del usuario
}

export function signToken(userId: string): string {
  const options = { expiresIn: EXPIRES_IN } as SignOptions;
  return jwt.sign({ sub: userId }, SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
