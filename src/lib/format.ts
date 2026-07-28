import { SdCloudApiError } from '../errors.js';

export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function toToolResult(data: unknown): ToolResult {
  const text = data === undefined ? '(no content)' : JSON.stringify(data, null, 2);
  return { content: [{ type: 'text', text }] };
}

export function toErrorResult(err: unknown): ToolResult {
  const text =
    err instanceof SdCloudApiError
      ? `SDCloud API error (HTTP ${err.status}${err.code !== undefined ? `, code ${err.code}` : ''}): ${err.message}`
      : err instanceof Error
        ? err.message
        : String(err);
  return { content: [{ type: 'text', text }], isError: true };
}
