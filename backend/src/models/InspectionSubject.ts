import mongoose, { Document, Schema } from 'mongoose';

/**
 * Inspection Subject — the thing being watched.
 * User creates these to declare what they want the AI to keep an eye on.
 */
export interface IInspectionSubject extends Document {
  ownerId?: string;           // no auth yet; keep optional
  kind: string;               // "phone" | "person" | "service" | "ai" | custom
  label: string;              // "Bank's phone", "Server prod-1", ...
  ctx: Record<string, unknown>; // free-form context the inspector reads
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IInspectionSubject>(
  {
    ownerId: { type: String, index: true },
    kind: { type: String, required: true, index: true },
    label: { type: String, required: true },
    ctx: { type: Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const InspectionSubject = mongoose.model<IInspectionSubject>(
  'InspectionSubject',
  schema,
);
