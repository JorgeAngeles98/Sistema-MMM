import { Request, Response } from "express";
import { Category } from "../models/Category";

export async function listCategories(
  _req: Request,
  res: Response
): Promise<void> {
  const categories = await Category.find().sort({ name: 1 });
  res.json({
    categories: categories.map((c) => ({ id: String(c._id), name: c.name })),
  });
}

export async function createCategory(
  req: Request,
  res: Response
): Promise<void> {
  const { name } = req.body ?? {};
  const clean = String(name ?? "").trim();
  if (!clean) {
    res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
    return;
  }
  const existing = await Category.findOne({ name: clean });
  if (existing) {
    res.json({ category: { id: String(existing._id), name: existing.name } });
    return;
  }
  const category = await Category.create({ name: clean });
  res
    .status(201)
    .json({ category: { id: String(category._id), name: category.name } });
}
