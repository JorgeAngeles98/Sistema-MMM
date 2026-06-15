import { Request, Response } from "express";
import path from "path";
import { FileModel, detectFileType } from "../models/File";
import { Folder } from "../models/Folder";
import { Category } from "../models/Category";
import {
  removeStoredFile,
  persistUpload,
  fileUrl,
  fileBufferFor,
} from "../config/storage";
import { readExif } from "../config/exif";

function serialize(f: any) {
  return {
    id: String(f._id),
    name: f.name,
    url: fileUrl(f.storedName),
    folder: f.folder?._id ? String(f.folder._id) : String(f.folder),
    folderName: f.folder?.name ?? null,
    category: f.category ?? "",
    type: f.type,
    mimeType: f.mimeType,
    size: f.size,
    extension: f.extension,
    // Básico
    title: f.title ?? "",
    author: f.author ?? "",
    authorTitle: f.authorTitle ?? "",
    description: f.description ?? "",
    descriptionWriter: f.descriptionWriter ?? "",
    rating: f.rating ?? 0,
    keywords: f.keywords ?? [],
    copyrightStatus: f.copyrightStatus ?? "",
    copyright: f.copyright ?? "",
    copyrightUrl: f.copyrightUrl ?? "",
    // Origen
    dateCreated: f.dateCreated ?? "",
    city: f.city ?? "",
    state: f.state ?? "",
    country: f.country ?? "",
    credit: f.credit ?? "",
    source: f.source ?? "",
    headline: f.headline ?? "",
    instructions: f.instructions ?? "",
    transmissionRef: f.transmissionRef ?? "",
    urgency: f.urgency ?? "",
    // Cámara
    exif: f.exif ?? null,
    createdAt: f.createdAt,
  };
}

function parseKeywords(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return String(value ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export async function listFiles(req: Request, res: Response): Promise<void> {
  const { folder, q, category, type } = req.query;
  const filter: Record<string, unknown> = {};
  if (folder) filter.folder = folder;
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (q) {
    const rx = { $regex: String(q), $options: "i" };
    filter.$or = [
      { name: rx },
      { title: rx },
      { keywords: rx },
      { description: rx },
      { author: rx },
    ];
  }
  filter.isDeleted = { $ne: true };
  const files = await FileModel.find(filter)
    .populate("folder", "name")
    .sort({ createdAt: -1 });
  res.json({ files: files.map(serialize) });
}

export async function getFile(req: Request, res: Response): Promise<void> {
  const file = await FileModel.findById(req.params.id);
  if (!file) {
    res.status(404).json({ message: "Archivo no encontrado" });
    return;
  }
  res.json({ file: serialize(file) });
}

export async function uploadFile(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "No se recibió ningún archivo" });
    return;
  }
  const body = req.body ?? {};
  const folder = await Folder.findById(body.folderId);
  if (!folder) {
    await removeStoredFile((file as any).filename);
    res.status(400).json({ message: "Carpeta inválida" });
    return;
  }

  const cleanCategory = String(body.category ?? "").trim();
  if (cleanCategory) {
    const exists = await Category.findOne({ name: cleanCategory });
    if (!exists) await Category.create({ name: cleanCategory });
  }

  const type = detectFileType(file.mimetype);
  const storedName = await persistUpload(file);
  const buf = type === "photo" ? await fileBufferFor(file) : null;
  const exif = buf ? await readExif(buf) : null;

  const created = await FileModel.create({
    name: file.originalname,
    storedName,
    folder: folder._id,
    category: cleanCategory,
    type,
    mimeType: file.mimetype,
    size: file.size,
    extension: path.extname(file.originalname).replace(".", "").toLowerCase(),
    uploadedBy: req.user?.id,
    title: body.title ?? "",
    author: body.author ?? "",
    authorTitle: body.authorTitle ?? "",
    description: body.description ?? "",
    descriptionWriter: body.descriptionWriter ?? "",
    rating: Number(body.rating) || 0,
    keywords: parseKeywords(body.keywords),
    copyrightStatus: body.copyrightStatus ?? "",
    copyright: body.copyright ?? "",
    copyrightUrl: body.copyrightUrl ?? "",
    dateCreated: body.dateCreated ?? "",
    city: body.city ?? "",
    state: body.state ?? "",
    country: body.country ?? "",
    credit: body.credit ?? "",
    source: body.source ?? "",
    headline: body.headline ?? "",
    instructions: body.instructions ?? "",
    transmissionRef: body.transmissionRef ?? "",
    urgency: body.urgency ?? "",
    exif,
  });

  res.status(201).json({ file: serialize(created) });
}

export async function updateFile(req: Request, res: Response): Promise<void> {
  const file = await FileModel.findById(req.params.id);
  if (!file) {
    res.status(404).json({ message: "Archivo no encontrado" });
    return;
  }
  const b = req.body ?? {};
  const textFields = [
    "title",
    "author",
    "authorTitle",
    "description",
    "descriptionWriter",
    "copyrightStatus",
    "copyright",
    "copyrightUrl",
    "dateCreated",
    "city",
    "state",
    "country",
    "credit",
    "source",
    "headline",
    "instructions",
    "transmissionRef",
    "urgency",
  ];
  for (const k of textFields) {
    if (b[k] !== undefined) (file as any)[k] = b[k];
  }
  if (b.rating !== undefined) file.rating = Number(b.rating) || 0;
  if (b.keywords !== undefined) file.keywords = parseKeywords(b.keywords);
  if (b.category !== undefined) {
    const c = String(b.category).trim();
    file.category = c;
    if (c) {
      const exists = await Category.findOne({ name: c });
      if (!exists) await Category.create({ name: c });
    }
  }
  await file.save();
  res.json({ file: serialize(file) });
}

export async function deleteFile(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const file = await FileModel.findById(id);
  if (!file) {
    res.status(404).json({ message: "Archivo no encontrado" });
    return;
  }
  file.isDeleted = true;
  file.deletedAt = new Date();
  await file.save();
  res.json({ ok: true });
}
