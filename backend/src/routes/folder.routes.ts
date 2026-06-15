import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth";
import { PERMISSIONS } from "../config/permissions";
import {
  listFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
} from "../controllers/folder.controller";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission(PERMISSIONS.FILES_READ), listFolders);
router.get("/:id", requirePermission(PERMISSIONS.FILES_READ), getFolder);
router.post("/", requirePermission(PERMISSIONS.FILES_UPLOAD), createFolder);
router.put("/:id", requirePermission(PERMISSIONS.FILES_UPLOAD), updateFolder);
router.delete("/:id", requirePermission(PERMISSIONS.FILES_DELETE), deleteFolder);

export default router;
