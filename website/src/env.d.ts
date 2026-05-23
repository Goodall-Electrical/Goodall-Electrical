/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly SMTP_FROM?: string;
  readonly GOODALL_INBOX?: string;
  readonly FERGUS_API_BASE?: string;
  readonly FERGUS_API_KEY?: string;
  readonly RATE_LIMIT_PER_HOUR?: string;
  readonly SUBMISSION_LOG_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
