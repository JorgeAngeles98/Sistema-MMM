import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth";
import { PERMISSIONS } from "../config/permissions";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

const router = Router();

router.use(requireAuth);
router.get("/", requirePermission(PERMISSIONS.USERS_READ), listUsers);
router.get("/:id", requirePermission(PERMISSIONS.USERS_READ), getUser);
router.post("/", requirePermission(PERMISSIONS.USERS_CREATE), createUser);
router.put("/:id", requirePermission(PERMISSIONS.USERS_UPDATE), updateUser);
router.delete("/:id", requirePermission(PERMISSIONS.USERS_DELETE), deleteUser);

export default router;
