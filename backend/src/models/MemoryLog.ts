import mongoose, { Document, Schema } from 'mongoose';

/**
 * Memory Log — a persistent core-memory entry the agent (or user) records.
 * "Hard" memory: durable in MongoDB, survives restarts, searchable.
 */
export interface IMemoryLog extends Document {
  category: string;            // "observation" | "decision" | "context" | "note" | free
  content: string;             // the actual memory text
  tags: string[];              // free-form labels for filtering
  source: string;              // who/what wrote it: "agent" | "manual" | "system" | ...
  metadata: Record<string, unknown>; // optional structured payload
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IMemoryLog>(
  {
    category: { type: String, required: true, index: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    source: { type: String, default: 'manual' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// text index for free-text search across content
schema.index({ content: 'text' });
// newest-first browsing
schema.index({ createdAt: -1 });

export const MemoryLog = mongoose.model<IMemoryLog>('MemoryLog', schema);
