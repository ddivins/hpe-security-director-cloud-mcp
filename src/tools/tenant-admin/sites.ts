import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

/**
 * /api/v2/* list endpoints use `spec.size`/`spec.from` query params only — no filters,
 * sortby, or count support, unlike the /api/v1 listParams pattern.
 */
const v2ListParams = {
  'spec.size': z.string().optional().describe('Max results per page.'),
  'spec.from': z.string().optional().describe('Starting index for pagination (zero-based).'),
};

export function registerSiteTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_create_site',
    {
      description: 'Create a new site.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/site', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_prevalidate_site',
    {
      description: 'Validate site parameters before creating a site.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/site/prevalidate', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_site',
    {
      description: 'Get a site by name.',
      inputSchema: { site_name: z.string() },
    },
    async ({ site_name }) => {
      try {
        const data = await client.request('GET', '/api/v2/site/{site_name}', {
          pathParams: { site_name },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_site',
    {
      description: 'Delete a site by name.',
      inputSchema: { site_name: z.string() },
    },
    async ({ site_name }) => {
      try {
        const data = await client.request('DELETE', '/api/v2/site/{site_name}', {
          pathParams: { site_name },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_site',
    {
      description: 'Update a site by name.',
      inputSchema: { site_name: z.string(), body: jsonBody },
    },
    async ({ site_name, body }) => {
      try {
        const data = await client.request('PUT', '/api/v2/site/{site_name}', {
          pathParams: { site_name },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_deploy_site',
    {
      description: 'Deploy a site by name.',
      inputSchema: { site_name: z.string(), body: jsonBody },
    },
    async ({ site_name, body }) => {
      try {
        const data = await client.request('POST', '/api/v2/site/{site_name}/deploy', {
          pathParams: { site_name },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_sites',
    {
      description: 'List sites with optional spec.size/spec.from pagination.',
      inputSchema: v2ListParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v2/sites', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_bulk_create_sites',
    {
      description: 'Create multiple sites in a single bulk request.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/bulk_site', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
