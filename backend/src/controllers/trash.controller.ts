import { Request, Response } from "express";
import { FileModel } from "../models/File";
import { Folder } from "../models/Folder";
import { removeStoredFile, fileUrl } from "../config/storage";

export async function listTrash(_req: Request, res: Response): Promise<void> {
  const [files, folders] = await Promise.all([
    FileModel.find({ isDeleted: true, deletedWithFolder: { $ne: true } })
      .populate("folder", "name")
      .sort({ deletedAt: -1 }),
    Folder.find({ isDeleted: true }).sort({ deletedAt: -1 }),
  ]);
  res.json({
    files: files.map((f: any) => ({
      id: String(f._id),
      name: f.name,
      title: f.title ?? "",
      url: fileUrl(f.storedName),
      type: f.type,
      folderName: f.folder?.name ?? null,
      deletedAt: f.deletedAt ?? null,
    })),
    folders: folders.map((f: any) => ({
      id: String(f._id),
      name: f.name,
      color: f.color ?? "",
      deletedAt: f.deletedAt ?? null,
    })),
  });
}

export async function restoreFile(req: Request, res: Response): Promise<void> {
  const f = await FileModel.findById(req.params.id);
  if (!f) {
    res.status(404).json({ message: "Archivo no encontrado" });
    return;
  }
  f.isDeleted = false;
  f.deletedAt = undefined;
  f.deletedWithFolder = false;
  await f.save();
  res.json({ ok: true });
}

export async function restoreFolder(req: Request, res: Response): Promise<void> {
  const folder = await Folder.findById(req.params.id);
  if (!folder) {
    res.status(404).json({ message: "Carpeta no encontrada" });
    return;
  }
  folder.isDeleted = false;
  folder.deletedAt = undefined;
  await folder.save();
  await FileModel.updateMany(
    { folder: folder._id, deletedWithFolder: true },
    { isDeleted: false, deletedWithFolder: false, deletedAt: null }
  );
  res.json({ ok: true });
}

export async function purgeFile(req: Request, res: Response): Promise<void> {
  const f = await FileModel.findById(req.params.id);
  if (!f) {
    res.status(404).json({ message: "Archivo no encontrado" });
    return;
  }
  await removeStoredFile(f.storedName);
  await f.deleteOne();
  res.json({ ok: true });
}

export async function purgeFolder(req: Request, res: Response): Promise<void> {
  const folder = await Folder.findById(req.params.id);
  if (!folder) {
    res.status(404).json({ message: "Carpeta no encontrada" });
    return;
  }
  const files = await FileModel.find({ folder: folder._id });
  for (const x of files) await removeStoredFile(x.storedName);
  await FileModel.deleteMany({ folder: folder._id });
  await folder.deleteOne();
  res.json({ ok: true });
}
