import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

// NAT pool list endpoint uses `filter` (singular) and does not support `count`,
// unlike most other security-object list endpoints.
const listParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filter: z.string().optional().describe('Filter conditions to apply to the results.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
};

export function registerNatPoolTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_nat_pools',
    {
      description: 'List NAT pool objects with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/nat_pools', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_nat_pool',
    {
      description:
        'Create a new NAT pool object. Body typically includes name, description, pool_type, pool_address.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/nat_pools', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_nat_pool',
    {
      description: 'Get a NAT pool object by pool ID.',
      inputSchema: { pool_id: z.string() },
    },
    async ({ pool_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/nat_pools/{pool_id}', {
          pathParams: { pool_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_nat_pool',
    {
      description: 'Update a NAT pool object by pool ID.',
      inputSchema: { pool_id: z.string(), body: jsonBody },
    },
    async ({ pool_id, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/nat_pools/{pool_id}', {
          pathParams: { pool_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_nat_pool',
    {
      description: 'Delete a NAT pool object by pool ID.',
      inputSchema: { pool_id: z.string() },
    },
    async ({ pool_id }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/nat_pools/{pool_id}', {
          pathParams: { pool_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
