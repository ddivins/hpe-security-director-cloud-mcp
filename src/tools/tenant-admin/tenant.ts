import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

/**
 * /api/v2/* list endpoints use `spec.size`/`spec.from` query params only — no filters,
 * sortby, or count support, unlike the /api/v1 listParams pattern.
 */
const v2ListParams = {
  'spec.size': z.string().optional().describe('Max results per page.'),
  'spec.from': z.string().optional().describe('Starting index for pagination (zero-based).'),
};

export function registerTenantTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_tenant_pops',
    {
      description: 'List tenant points-of-presence with optional spec.size/spec.from pagination.',
      inputSchema: v2ListParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v2/tenant-pops', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_tenant_id',
    {
      description: 'Get the tenant ID / token scope for the authenticated caller.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v2/tenant/tenant-id');
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
