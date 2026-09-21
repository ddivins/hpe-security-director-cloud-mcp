import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface AuditLogEntry {
  timestamp: string;
  tool: string;
  org: string;
  status: 'success' | 'error' | 'denied';
  parameters_hash: string;
  response_size_bytes?: number;
  duration_ms: number;
  error?: string;
  request_id: string;
}

const HMAC_KEY = process.env.SDCLOUD_LOG_HMAC_KEY || 'default-insecure-key-change-in-prod';
const LOG_DIR = process.env.SDCLOUD_LOG_DIR || './logs';
const LOG_LEVEL = process.env.SDCLOUD_LOG_LEVEL || 'info';

// Ensure log directory exists
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true, mode: 0o700 });
  }
}

// HMAC-hash sensitive data to prevent cleartext logging
function hashSensitiveData(data: any): string {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto
    .createHmac('sha256', HMAC_KEY)
    .update(json)
    .digest('hex')
    .slice(0, 16); // truncate for readability
}

// Get current log file path (rotate daily)
function getLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `audit-${date}.jsonl`);
}

// Write audit log entry
export function auditLog(entry: AuditLogEntry): void {
  try {
    ensureLogDir();
    const logFile = getLogFilePath();
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(logFile, line, { mode: 0o640 });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

// Create a request ID for tracing
export function generateRequestId(): string {
  return crypto.randomBytes(8).toString('hex');
}

// Log a tool call
export function logToolCall(
  toolName: string,
  org: string,
  params: any,
  status: 'success' | 'error' | 'denied',
  durationMs: number,
  responseSize?: number,
  error?: string
): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    tool: toolName,
    org,
    status,
    parameters_hash: hashSensitiveData(params),
    duration_ms: durationMs,
    error,
    request_id: generateRequestId(),
  };

  if (responseSize !== undefined) {
    entry.response_size_bytes = responseSize;
  }

  if (LOG_LEVEL === 'debug') {
    console.log(`[AUDIT] ${toolName} (${org}): ${status}`);
  }

  auditLog(entry);
}

// List recent audit logs
export function getRecentLogs(days: number = 7): AuditLogEntry[] {
  const logs: AuditLogEntry[] = [];

  try {
    ensureLogDir();
    const files = fs.readdirSync(LOG_DIR).filter((f) => f.startsWith('audit-'));

    for (const file of files) {
      const filePath = path.join(LOG_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim());

      for (const line of lines) {
        try {
          logs.push(JSON.parse(line));
        } catch {
          // skip malformed lines
        }
      }
    }
  } catch (error) {
    console.error('Failed to read audit logs:', error);
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Summarize audit logs (tool usage by org)
export function summarizeLogs(days: number = 7): Record<string, Record<string, number>> {
  const logs = getRecentLogs(days);
  const summary: Record<string, Record<string, number>> = {};

  for (const log of logs) {
    if (!summary[log.org]) {
      summary[log.org] = {};
    }

    if (!summary[log.org][log.tool]) {
      summary[log.org][log.tool] = 0;
    }

    summary[log.org][log.tool]++;
  }

  return summary;
}
