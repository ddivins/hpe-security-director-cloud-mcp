import { logToolCall } from '../logging.js';

// Extract org name from tool name or server context
export function getOrgFromContext(toolName: string): string {
  // Tool names from MCP servers are prefixed like: hpe-sd-cloud-lab__sdcloud_list_devices
  // Extract the org prefix
  const match = toolName.match(/^([^_]+(?:_[^_]+)*)__/);
  if (match) {
    return match[1].replace(/_/g, '-');
  }
  return 'unknown';
}

// Wrap a tool handler with audit logging
export function withAuditLogging(
  toolName: string,
  handler: (params: Record<string, unknown>) => Promise<any>
) {
  return async (params: Record<string, unknown>) => {
    const org = getOrgFromContext(toolName);
    const startTime = Date.now();
    let responseSize = 0;

    try {
      const result = await handler(params);
      const duration = Date.now() - startTime;

      // Estimate response size from JSON stringification
      try {
        responseSize = JSON.stringify(result).length;
      } catch {
        responseSize = 0;
      }

      logToolCall(toolName, org, params, 'success', duration, responseSize);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logToolCall(toolName, org, params, 'error', duration, undefined, errorMessage);
      throw error;
    }
  };
}
