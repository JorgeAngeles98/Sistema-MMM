import { Router } from "express";
import {
  login,
  me,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);
router.put("/password", requireAuth, changePassword);

export default router;
