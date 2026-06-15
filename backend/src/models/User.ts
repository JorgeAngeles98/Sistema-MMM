import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Types.ObjectId;
  isActive: boolean;
  isSystem: boolean;
  lastLogin?: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: "", trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    isActive: { type: Boolean, default: true },
    // Cuenta de administrador del sistema: protegida (no se puede cambiar
    // su correo ni su rol, ni desactivarla o eliminarla).
    isSystem: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
