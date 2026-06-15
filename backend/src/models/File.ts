import mongoose, { Schema, Document, Types } from "mongoose";

export type FileType = "photo" | "video" | "document";

export interface IExif {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: number;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  dateTaken?: Date;
  width?: number;
  height?: number;
  orientation?: number;
  resolution?: number;
  flash?: string;
  gpsLat?: number;
  gpsLng?: number;
}

export interface IFile extends Document {
  name: string;
  storedName: string;
  folder: Types.ObjectId;
  category?: string;
  type: FileType;
  mimeType: string;
  size: number;
  extension: string;
  uploadedBy?: Types.ObjectId;
  // IPTC — Básico
  title?: string;
  author?: string;
  authorTitle?: string;
  description?: string;
  descriptionWriter?: string;
  rating?: number;
  keywords: string[];
  copyrightStatus?: string;
  copyright?: string;
  copyrightUrl?: string;
  // IPTC — Origen
  dateCreated?: string;
  city?: string;
  state?: string;
  country?: string;
  credit?: string;
  source?: string;
  headline?: string;
  instructions?: string;
  transmissionRef?: string;
  urgency?: string;
  // Cámara
  exif?: IExif;
  // Papelera
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedWithFolder?: boolean;
}

const fileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    storedName: { type: String, required: true },
    folder: { type: Schema.Types.ObjectId, ref: "Folder", required: true },
    category: { type: String, default: "", trim: true },
    type: { type: String, enum: ["photo", "video", "document"], required: true },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    extension: { type: String, default: "" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, default: "" },
    author: { type: String, default: "" },
    authorTitle: { type: String, default: "" },
    description: { type: String, default: "" },
    descriptionWriter: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    keywords: { type: [String], default: [] },
    copyrightStatus: { type: String, default: "" },
    copyright: { type: String, default: "" },
    copyrightUrl: { type: String, default: "" },
    dateCreated: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    credit: { type: String, default: "" },
    source: { type: String, default: "" },
    headline: { type: String, default: "" },
    instructions: { type: String, default: "" },
    transmissionRef: { type: String, default: "" },
    urgency: { type: String, default: "" },
    exif: { type: Schema.Types.Mixed, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedWithFolder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FileModel = mongoose.model<IFile>("File", fileSchema);

export function detectFileType(mime: string): FileType {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  return "document";
}
