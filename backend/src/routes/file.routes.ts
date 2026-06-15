import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth";
import { PERMISSIONS } from "../config/permissions";
import { upload } from "../config/storage";
import {
  listFiles,
  getFile,
  uploadFile,
  updateFile,
  deleteFile,
} from "../controllers/file.controller";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission(PERMISSIONS.FILES_READ), listFiles);
router.get("/:id", requirePermission(PERMISSIONS.FILES_READ), getFile);
router.post(
  "/",
  requirePermission(PERMISSIONS.FILES_UPLOAD),
  upload.single("file"),
  uploadFile
);
router.put("/:id", requirePermission(PERMISSIONS.FILES_UPLOAD), updateFile);
router.delete("/:id", requirePermission(PERMISSIONS.FILES_DELETE), deleteFile);

export default router;
