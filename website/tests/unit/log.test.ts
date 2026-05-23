import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSubmissionLog } from "../../src/lib/log";

describe("createSubmissionLog", () => {
  let dir: string;
  let path: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "goodall-log-"));
    path = join(dir, "submissions.jsonl");
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("appends a JSON line per record", async () => {
    const log = createSubmissionLog(path);
    await log.append({ kind: "contact", name: "A" });
    await log.append({ kind: "quote", name: "B" });
    const lines = readFileSync(path, "utf8").trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0])).toMatchObject({ kind: "contact", name: "A" });
    expect(JSON.parse(lines[1])).toMatchObject({ kind: "quote", name: "B" });
  });

  it("includes an ISO timestamp on each record", async () => {
    const log = createSubmissionLog(path);
    await log.append({ kind: "contact" });
    const line = readFileSync(path, "utf8").trim();
    const parsed = JSON.parse(line);
    expect(parsed.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("creates parent directories if missing", async () => {
    const nested = join(dir, "deeper", "dir", "log.jsonl");
    const log = createSubmissionLog(nested);
    await log.append({ kind: "contact" });
    expect(readFileSync(nested, "utf8")).toContain("contact");
  });
});
