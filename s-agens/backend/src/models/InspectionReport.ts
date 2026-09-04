import mongoose, { Document, Schema } from 'mongoose';

/**
 * Inspection Report — a single observation about a target.
 * Target can be anything: a phone, a person, a service, a device, an AI.
 * The system is domain-agnostic; the caller labels what's being inspected.
 */
export interface IInspectionReport extends Document {
  subjectId: string;           // stable id for the thing being inspected
  subjectKind: string;         // "phone" | "person" | "service" | ...
  status: 'ok' | 'warn' | 'alert';
  score: number;               // 0..100 rough health
  summary: string;             // 1-line human-readable
  detail: Record<string, unknown>; // raw structured payload
  aiProvider?: string;         // which brand generated this (if any)
  createdAt: Date;
}

const schema = new Schema<IInspectionReport>(
  {
    subjectId: { type: String, required: true, index: true },
    subjectKind: { type: String, required: true, index: true },
    status: { type: String, enum: ['ok', 'warn', 'alert'], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, required: true },
    detail: { type: Schema.Types.Mixed, default: {} },
    aiProvider: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

schema.index({ subjectId: 1, createdAt: -1 });

export const InspectionReport = mongoose.model<IInspectionReport>(
  'InspectionReport',
  schema,
);
