import mongoose, { Schema, Document, Types } from "mongoose";

export type TaskStatus = "pending" | "in_progress" | "done";

export interface ITask extends Document {
  title: string;
  description?: string;
  file?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: TaskStatus;
  dueDate?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    file: { type: Schema.Types.ObjectId, ref: "File" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>("Task", taskSchema);
