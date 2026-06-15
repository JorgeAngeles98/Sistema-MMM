import { Request, Response } from "express";
import { Folder } from "../models/Folder";
import { FileModel } from "../models/File";
import { Category } from "../models/Category";

async function serializeFolder(f: any) {
  return {
    id: String(f._id),
    name: f.name,
    description: f.description ?? "",
    category: f.category ?? "",
    color: f.color ?? "",
    status: f.status ?? "active",
    fileCount: await FileModel.countDocuments({
      folder: f._id,
      isDeleted: { $ne: true },
    }),
    createdAt: f.createdAt ?? null,
  };
}

// Registra una categoría nueva en el catálogo (híbrido).
async function ensureCategory(name?: string): Promise<void> {
  const clean = String(name ?? "").trim();
  if (!clean) return;
  const exists = await Category.findOne({ name: clean });
  if (!exists) await Category.create({ name: clean });
}

// GET /api/folders?q=&category=&status=&color=
export async function listFolders(req: Request, res: Response): Promise<void> {
  const { q, category, status, color } = req.query;
  const filter: Record<string, unknown> = {};
  if (q) filter.name = { $regex: String(q), $options: "i" };
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (color) filter.color = color;
  filter.isDeleted = { $ne: true };

  const folders = await Folder.find(filter).sort({ name: 1 });
  const result = await Promise.all(folders.map(serializeFolder));
  res.json({ folders: result });
}

export async function getFolder(req: Request, res: Response): Promise<void> {
  const folder = await Folder.findById(req.params.id);
  if (!folder) {
    res.status(404).json({ message: "Carpeta no encontrada" });
    return;
  }
  res.json({ folder: await serializeFolder(folder) });
}

export async function createFolder(req: Request, res: Response): Promise<void> {
  const { name, description, category, color, status } = req.body ?? {};
  if (!name || !String(name).trim()) {
    res.status(400).json({ message: "El nombre de la carpeta es obligatorio" });
    return;
  }
  await ensureCategory(category);
  const folder = await Folder.create({
    name: String(name).trim(),
    description: description ?? "",
    category: String(category ?? "").trim(),
    color: color ?? "",
    status: status === "archived" ? "archived" : "active",
    createdBy: req.user?.id,
  });
  res.status(201).json({ folder: await serializeFolder(folder) });
}

export async function updateFolder(req: Request, res: Response): Promise<void> {
  const { name, description, category, color, status } = req.body ?? {};
  const folder = await Folder.findById(req.params.id);
  if (!folder) {
    res.status(404).json({ message: "Carpeta no encontrada" });
    return;
  }
  if (name !== undefined) {
    if (!String(name).trim()) {
      res.status(400).json({ message: "El nombre es obligatorio" });
      return;
    }
    folder.name = String(name).trim();
  }
  if (description !== undefined) folder.description = description;
  if (category !== undefined) {
    folder.category = String(category).trim();
    await ensureCategory(category);
  }
  if (color !== undefined) folder.color = color;
  if (status !== undefined) {
    folder.status = status === "archived" ? "archived" : "active";
  }
  await folder.save();
  res.json({ folder: await serializeFolder(folder) });
}

export async function deleteFolder(req: Request, res: Response): Promise<void> {
  const folder = await Folder.findById(req.params.id);
  if (!folder) {
    res.status(404).json({ message: "Carpeta no encontrada" });
    return;
  }
  // Papelera: soft-delete de la carpeta y, en cascada, de sus archivos.
  const now = new Date();
  folder.isDeleted = true;
  folder.deletedAt = now;
  await folder.save();
  await FileModel.updateMany(
    { folder: folder._id, isDeleted: { $ne: true } },
    { isDeleted: true, deletedAt: now, deletedWithFolder: true }
  );
  res.json({ ok: true });
}
