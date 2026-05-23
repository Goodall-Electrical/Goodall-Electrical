import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export interface SubmissionLog {
  append(record: Record<string, unknown>): Promise<void>;
}

export function createSubmissionLog(path: string): SubmissionLog {
  let dirReady: Promise<void> | null = null;
  const ensureDir = () => {
    if (!dirReady) dirReady = mkdir(dirname(path), { recursive: true }).then(() => {});
    return dirReady;
  };
  return {
    async append(record) {
      await ensureDir();
      const line = JSON.stringify({ ts: new Date().toISOString(), ...record }) + "\n";
      await appendFile(path, line, "utf8");
    },
  };
}
