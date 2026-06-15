import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// Cifra la contraseña con bcrypt antes de guardarla.
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Compara una contraseña en texto plano contra el hash almacenado.
export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
