import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

/**
 * The external probe is a singleton per-tenant resource: GET/DELETE/POST all operate on
 * /api/v2/external-probe with no path or query params to identify a target.
 */
export function registerExternalProbeTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_external_probe',
    {
      description: 'Get the tenant external probe configuration.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v2/external-probe');
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_external_probe',
    {
      description: 'Delete the tenant external probe configuration.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('DELETE', '/api/v2/external-probe');
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_external_probe',
    {
      description: 'Create the tenant external probe configuration.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/external-probe', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
