import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth";
import { PERMISSIONS } from "../config/permissions";
import { listRoles } from "../controllers/role.controller";

const router = Router();

router.get("/", requireAuth, requirePermission(PERMISSIONS.ROLES_READ), listRoles);

export default router;
