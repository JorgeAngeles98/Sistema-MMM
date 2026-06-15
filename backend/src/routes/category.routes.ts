import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth";
import { PERMISSIONS } from "../config/permissions";
import {
  listCategories,
  createCategory,
} from "../controllers/category.controller";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission(PERMISSIONS.FILES_READ), listCategories);
router.post("/", requirePermission(PERMISSIONS.FILES_UPLOAD), createCategory);

export default router;
