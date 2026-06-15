import { Request, Response } from "express";
import { FileModel } from "../models/File";
import { Folder } from "../models/Folder";
import { Category } from "../models/Category";
import { User } from "../models/User";
import { Task } from "../models/Task";
import { PERMISSIONS } from "../config/permissions";

export async function getStats(req: Request, res: Response): Promise<void> {
  const perms = req.user?.permissions ?? [];
  const canFiles = perms.includes(PERMISSIONS.FILES_READ);
  const canUsers = perms.includes(PERMISSIONS.USERS_READ);
  const canTasks = perms.includes(PERMISSIONS.TASKS_READ);
  const canTasksManage = perms.includes(PERMISSIONS.TASKS_MANAGE);

  const result: Record<string, unknown> = {};

  if (canFiles) {
    const [total, photos, videos, documents, sizeAgg, folders, categories, recent] =
      await Promise.all([
        FileModel.countDocuments({ isDeleted: { $ne: true } }),
        FileModel.countDocuments({ type: "photo", isDeleted: { $ne: true } }),
        FileModel.countDocuments({ type: "video", isDeleted: { $ne: true } }),
        FileModel.countDocuments({ type: "document", isDeleted: { $ne: true } }),
        FileModel.aggregate([
          { $match: { isDeleted: { $ne: true } } },
          { $group: { _id: null, total: { $sum: "$size" } } },
        ]),
        Folder.countDocuments({ isDeleted: { $ne: true } }),
        Category.countDocuments({}),
        FileModel.find({ isDeleted: { $ne: true } })
          .sort({ createdAt: -1 })
          .limit(6)
          .populate("folder", "name"),
      ]);
    result.files = {
      total,
      photos,
      videos,
      documents,
      totalSize: sizeAgg[0]?.total ?? 0,
    };
    result.folders = folders;
    result.categories = categories;
    result.recentFiles = recent.map((f: any) => ({
      id: String(f._id),
      name: f.name,
      title: f.title ?? "",
      url: `/uploads/${f.storedName}`,
      type: f.type,
      folderId: f.folder ? String(f.folder._id) : null,
      folderName: f.folder?.name ?? null,
      createdAt: f.createdAt,
    }));
  }

  if (canUsers) {
    result.users = await User.countDocuments({});
  }

  if (canTasks) {
    const scopeFilter = canTasksManage ? {} : { assignedTo: req.user!.id };
    const [tt, tp, ti, td] = await Promise.all([
      Task.countDocuments(scopeFilter),
      Task.countDocuments({ ...scopeFilter, status: "pending" }),
      Task.countDocuments({ ...scopeFilter, status: "in_progress" }),
      Task.countDocuments({ ...scopeFilter, status: "done" }),
    ]);
    result.tasks = {
      total: tt,
      pending: tp,
      in_progress: ti,
      done: td,
      scope: canTasksManage ? "all" : "mine",
    };
  }

  res.json(result);
}
