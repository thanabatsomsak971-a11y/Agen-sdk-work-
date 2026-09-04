import { Server as IOServer } from 'socket.io';
import { env } from '../config/env';
import { InspectionSubject } from '../models/InspectionSubject';
import { InspectionReport } from '../models/InspectionReport';
import { ensemble } from '../ai/EnsembleRouter';

/**
 * InspectionRunner — the "agentic" loop.
 * Every INSPECTION_INTERVAL_MS, iterate active subjects,
 * ask the ensemble to inspect, persist report, broadcast over Socket.io.
 */
export class InspectionRunner {
  private timer: NodeJS.Timeout | null = null;

  constructor(private io: IOServer) {}

  start(): void {
    if (this.timer) return;
    // eslint-disable-next-line no-console
    console.log(`🔁 InspectionRunner: tick every ${env.INSPECTION_INTERVAL_MS}ms`);
    this.timer = setInterval(() => {
      this.tick().catch((err) => console.error('Runner tick failed:', err));
    }, env.INSPECTION_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick(): Promise<void> {
    const subjects = await InspectionSubject.find({ active: true }).limit(20);
    for (const s of subjects) {
      const answer = await ensemble.inspect({
        subjectKind: s.kind,
        label: s.label,
        ctx: s.ctx,
      });
      if (!answer) continue; // AI inspection not implemented — no fake report
      const report = await InspectionReport.create({
        subjectId: String(s._id),
        subjectKind: s.kind,
        status: answer.status,
        score: answer.score,
        summary: answer.summary,
        detail: (answer.raw as Record<string, unknown>) ?? {},
        aiProvider: answer.brand,
      });
      this.io.emit('report', {
        id: String(report._id),
        subjectId: String(s._id),
        subjectLabel: s.label,
        subjectKind: s.kind,
        status: report.status,
        score: report.score,
        summary: report.summary,
        aiProvider: report.aiProvider,
        createdAt: report.createdAt.toISOString(),
      });
    }
  }
}
