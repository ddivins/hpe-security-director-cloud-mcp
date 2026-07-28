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

export function registerTunnelTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_tunnel',
    {
      description: 'Get a tunnel by ID.',
      inputSchema: { tunnel_id: z.string() },
    },
    async ({ tunnel_id }) => {
      try {
        const data = await client.request('GET', '/api/v2/tunnel/{tunnel_id}', {
          pathParams: { tunnel_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_tunnels',
    {
      description: 'List tunnels with optional spec.size/spec.from pagination.',
      inputSchema: v2ListParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v2/tunnels', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_tunnel_status_count',
    {
      description: 'Get a count of tunnels grouped by status.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v2/tunnels/status/count');
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
