import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(requireAuth);
router.get("/", listNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markRead);

export default router;
