import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export async function listNotifications(
  req: Request,
  res: Response
): Promise<void> {
  const items = await Notification.find({ user: req.user!.id })
    .sort({ createdAt: -1 })
    .limit(30);
  const unread = await Notification.countDocuments({
    user: req.user!.id,
    read: false,
  });
  res.json({
    unread,
    notifications: items.map((n: any) => ({
      id: String(n._id),
      message: n.message,
      link: n.link ?? "",
      read: n.read,
      createdAt: n.createdAt,
    })),
  });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  await Notification.updateOne(
    { _id: req.params.id, user: req.user!.id },
    { read: true }
  );
  res.json({ ok: true });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  await Notification.updateMany(
    { user: req.user!.id, read: false },
    { read: true }
  );
  res.json({ ok: true });
}
