import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth";
import { PERMISSIONS } from "../config/permissions";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission(PERMISSIONS.TASKS_READ), listTasks);
router.get("/:id", requirePermission(PERMISSIONS.TASKS_READ), getTask);
router.post("/", requirePermission(PERMISSIONS.TASKS_MANAGE), createTask);
// Update permitido a tasks:read; el controlador restringe a gestor o asignado.
router.put("/:id", requirePermission(PERMISSIONS.TASKS_READ), updateTask);
router.delete("/:id", requirePermission(PERMISSIONS.TASKS_MANAGE), deleteTask);

export default router;
