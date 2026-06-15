import { Request, Response } from "express";
import { Task } from "../models/Task";
import { Notification } from "../models/Notification";
import { PERMISSIONS } from "../config/permissions";

async function notifyAssignment(
  assignedTo: unknown,
  byUserId: string | undefined,
  title: string
): Promise<void> {
  if (!assignedTo) return;
  if (String(assignedTo) === String(byUserId)) return; // no auto-notificar
  await Notification.create({
    user: assignedTo,
    message: `Se te asignó la tarea "${title}"`,
    link: "/tareas",
  });
}

function userName(u: any): string | null {
  if (!u) return null;
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
}

function serialize(t: any) {
  return {
    id: String(t._id),
    title: t.title,
    description: t.description ?? "",
    status: t.status,
    dueDate: t.dueDate ?? null,
    file: t.file ? { id: String(t.file._id), name: t.file.name } : null,
    assignedTo: t.assignedTo
      ? { id: String(t.assignedTo._id), name: userName(t.assignedTo) }
      : null,
    createdBy: t.createdBy
      ? { id: String(t.createdBy._id), name: userName(t.createdBy) }
      : null,
    createdAt: t.createdAt,
  };
}

function populateAll(query: any) {
  return query
    .populate("file", "name")
    .populate("assignedTo", "firstName lastName")
    .populate("createdBy", "firstName lastName");
}

function isManager(req: Request): boolean {
  return !!req.user?.permissions.includes(PERMISSIONS.TASKS_MANAGE);
}

export async function listTasks(req: Request, res: Response): Promise<void> {
  const filter: Record<string, unknown> = {};
  if (req.query.file) filter.file = req.query.file;
  if (req.query.status) filter.status = req.query.status;
  // Los que no gestionan solo ven sus tareas asignadas
  if (!isManager(req)) {
    filter.assignedTo = req.user!.id;
  } else if (req.query.assignedTo) {
    filter.assignedTo = req.query.assignedTo;
  }
  const tasks = await populateAll(Task.find(filter)).sort({ createdAt: -1 });
  res.json({ tasks: tasks.map(serialize) });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await populateAll(Task.findById(req.params.id));
  if (!task) {
    res.status(404).json({ message: "Tarea no encontrada" });
    return;
  }
  res.json({ task: serialize(task) });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const { title, description, fileId, assignedTo, dueDate, status } =
    req.body ?? {};
  if (!title || !String(title).trim()) {
    res.status(400).json({ message: "El título es obligatorio" });
    return;
  }
  const task = await Task.create({
    title: String(title).trim(),
    description: description ?? "",
    file: fileId || undefined,
    assignedTo: assignedTo || undefined,
    createdBy: req.user!.id,
    status: status || "pending",
    dueDate: dueDate || undefined,
  });
  await notifyAssignment(task.assignedTo, req.user?.id, task.title);
  const populated = await populateAll(Task.findById(task._id));
  res.status(201).json({ task: serialize(populated) });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404).json({ message: "Tarea no encontrada" });
    return;
  }
  const manager = isManager(req);
  const assignee =
    task.assignedTo && String(task.assignedTo) === req.user!.id;
  if (!manager && !assignee) {
    res.status(403).json({ message: "No puedes modificar esta tarea" });
    return;
  }

  const prevAssignee = task.assignedTo ? String(task.assignedTo) : null;
  const b = req.body ?? {};
  if (manager) {
    if (b.title !== undefined) task.title = b.title;
    if (b.description !== undefined) task.description = b.description;
    if (b.status !== undefined) task.status = b.status;
    if (b.dueDate !== undefined) task.dueDate = b.dueDate || undefined;
    if (b.assignedTo !== undefined)
      task.assignedTo = b.assignedTo || undefined;
    if (b.fileId !== undefined) task.file = b.fileId || undefined;
  } else {
    // El asignado solo puede cambiar el estado
    if (b.status !== undefined) task.status = b.status;
  }
  await task.save();
  // Notificar si se asignó a un usuario distinto
  if (
    manager &&
    task.assignedTo &&
    String(task.assignedTo) !== prevAssignee
  ) {
    await notifyAssignment(task.assignedTo, req.user?.id, task.title);
  }
  const populated = await populateAll(Task.findById(task._id));
  res.json({ task: serialize(populated) });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    res.status(404).json({ message: "Tarea no encontrada" });
    return;
  }
  res.json({ ok: true });
}
