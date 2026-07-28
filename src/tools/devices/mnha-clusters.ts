import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

/** Registers tools for /api/v1/mnha_clusters (Multi-Node High Availability cluster sync). */
export function registerMnhaClusterTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_mnha_cluster_sync_status',
    {
      description: 'Get the status of an MNHA (Multi-Node High Availability) cluster sync job.',
      inputSchema: { mnha_sync_id: z.string() },
    },
    async ({ mnha_sync_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/mnha_clusters/sync/{mnha_sync_id}', {
          pathParams: { mnha_sync_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_sync_mnha_cluster',
    {
      description: 'Trigger a sync of an MNHA (Multi-Node High Availability) cluster. Returns a job id; poll sdcloud_get_mnha_cluster_sync_status for progress.',
      inputSchema: { mnha_cluster_id: z.string(), body: jsonBody },
    },
    async ({ mnha_cluster_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/mnha_clusters/{mnha_cluster_id}/sync', {
          pathParams: { mnha_cluster_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
