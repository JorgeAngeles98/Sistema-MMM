import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth";
import { PERMISSIONS } from "../config/permissions";
import {
  listTrash,
  restoreFile,
  restoreFolder,
  purgeFile,
  purgeFolder,
} from "../controllers/trash.controller";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission(PERMISSIONS.FILES_READ), listTrash);
router.post("/files/:id/restore", requirePermission(PERMISSIONS.FILES_UPLOAD), restoreFile);
router.post("/folders/:id/restore", requirePermission(PERMISSIONS.FILES_UPLOAD), restoreFolder);
router.delete("/files/:id", requirePermission(PERMISSIONS.FILES_DELETE), purgeFile);
router.delete("/folders/:id", requirePermission(PERMISSIONS.FILES_DELETE), purgeFolder);

export default router;
