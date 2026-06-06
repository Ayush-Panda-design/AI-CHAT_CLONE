import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  provider: "email" | "google";
  googleId?: string;
  role: "user" | "admin";
  theme: "dark" | "light" | "system";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, select: false },
  avatar: { type: String },
  provider: { type: String, enum: ["email", "google"], default: "email" },
  googleId: { type: String, sparse: true, index: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
