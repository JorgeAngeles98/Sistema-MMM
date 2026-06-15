import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, dbState } from "./config/db";
import { UPLOAD_DIR } from "./config/storage";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import folderRoutes from "./routes/folder.routes";
import categoryRoutes from "./routes/category.routes";
import fileRoutes from "./routes/file.routes";
import taskRoutes from "./routes/task.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import trashRoutes from "./routes/trash.routes";
import notificationRoutes from "./routes/notification.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Archivos subidos (demo: almacenamiento local)
app.use("/uploads", express.static(UPLOAD_DIR));

// Healthcheck
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", db: dbState(), uptime: process.uptime() });
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/notifications", notificationRoutes);

// Conexión a MongoDB (no detiene el server si falla; muestra cómo arreglarlo)
connectDB().catch((err) => {
  console.error("\n[backend] ⚠️  No se pudo conectar a MongoDB:", err.message);
  console.error("[backend]    Levanta Mongo con:  docker compose up -d mongo");
  console.error("[backend]    Luego ejecuta el seed:  npm run seed -w backend\n");
});

app.listen(PORT, () => {
  console.log(`[backend] API escuchando en http://localhost:${PORT}`);
});
