export type FileType = "photo" | "video" | "document";

export function detectTypeFromMime(mime: string): FileType {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

export function fileTypeLabel(type: FileType): string {
  return type === "photo" ? "Foto" : type === "video" ? "Video" : "Documento";
}

export function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}
