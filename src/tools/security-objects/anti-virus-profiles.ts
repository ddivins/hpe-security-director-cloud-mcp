import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

const listParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filters: z.string().optional().describe('Filter conditions to apply to the results.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
  count: z.boolean().optional().describe('If true, return only the total count, no item details.'),
};

/**
 * Flat CRUD for /api/v1/anti_virus_profiles.
 */
export function registerAntiVirusProfileTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_anti_virus_profiles',
    {
      description: 'List anti-virus profile objects with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/anti_virus_profiles', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_anti_virus_profile',
    {
      description: 'Create a new anti-virus profile object.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/anti_virus_profiles', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_anti_virus_profile',
    {
      description: 'Get an anti-virus profile object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/anti_virus_profiles/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_anti_virus_profile',
    {
      description: 'Update an anti-virus profile object by UUID.',
      inputSchema: { uuid: z.string(), body: jsonBody },
    },
    async ({ uuid, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/anti_virus_profiles/{uuid}', {
          pathParams: { uuid },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_anti_virus_profile',
    {
      description: 'Delete an anti-virus profile object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/anti_virus_profiles/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
