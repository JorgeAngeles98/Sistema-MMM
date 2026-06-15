import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Role } from "./models/Role";
import { User } from "./models/User";
import { Category } from "./models/Category";
import { ALL_PERMISSIONS, PERMISSIONS } from "./config/permissions";
import { hashPassword } from "./utils/password";

dotenv.config();

const ADMIN_EMAIL = "admin@qnas.local";
const ADMIN_PASSWORD = "Admin123!";

async function seed() {
  await connectDB();

  // Rol admin: acceso total
  const adminRole = await Role.findOneAndUpdate(
    { name: "admin" },
    { name: "admin", description: "Acceso total al sistema", permissions: ALL_PERMISSIONS },
    { upsert: true, new: true }
  );

  // Rol usuario: solo lectura de archivos y tareas
  await Role.findOneAndUpdate(
    { name: "user" },
    {
      name: "user",
      description: "Usuario estándar",
      permissions: [PERMISSIONS.FILES_READ, PERMISSIONS.TASKS_READ],
    },
    { upsert: true, new: true }
  );

  // Usuario administrador inicial
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    await User.create({
      firstName: "Administrador",
      lastName: "del Sistema",
      email: ADMIN_EMAIL,
      phone: "",
      passwordHash,
      role: adminRole!._id,
      isSystem: true,
    });
    console.log(`\n✅ Usuario admin creado:`);
    console.log(`   Email:      ${ADMIN_EMAIL}`);
    console.log(`   Contraseña: ${ADMIN_PASSWORD}`);
    console.log(`   (cámbiala después de iniciar sesión)\n`);
  } else {
    // Migración de la cuenta admin existente.
    let changed = false;
    if (!existing.firstName) {
      existing.firstName = "Administrador";
      existing.lastName = "del Sistema";
      changed = true;
    }
    if (!existing.isSystem) {
      existing.isSystem = true;
      changed = true;
    }
    if (changed) {
      await existing.save();
      console.log("🔄 Usuario admin actualizado (nombres / cuenta de sistema).");
    } else {
      console.log("ℹ️  El usuario admin ya existe, no se recrea.");
    }
  }

  // Categorías predefinidas (el usuario puede crear más).
  const baseCategories = ["Marketing", "Productos", "Eventos", "General"];
  for (const name of baseCategories) {
    await Category.findOneAndUpdate({ name }, { name }, { upsert: true });
  }
  console.log("✅ Categorías base listas.");

  console.log("✅ Seed completado.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
