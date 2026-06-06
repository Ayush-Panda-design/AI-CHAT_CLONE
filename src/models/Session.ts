import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  expiresAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  refreshToken: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
});

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
