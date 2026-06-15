import mongoose, { Schema, Document, Types } from "mongoose";

export type FolderStatus = "active" | "archived";

export interface IFolder extends Document {
  name: string;
  description?: string;
  category?: string;
  color?: string;
  status: FolderStatus;
  createdBy?: Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    color: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const Folder = mongoose.model<IFolder>("Folder", folderSchema);
