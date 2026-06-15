import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: string[];
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>("Role", roleSchema);
