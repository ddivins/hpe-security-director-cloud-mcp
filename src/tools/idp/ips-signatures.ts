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
 * Flat 5-op CRUD for /api/v1/ips_signatures.
 */
export function registerIpsSignatureTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_ips_signatures',
    {
      description: 'List IPS signature objects with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_signatures', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_ips_signature',
    {
      description: 'Create a new IPS signature object.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/ips_signatures', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ips_signature',
    {
      description: 'Get an IPS signature object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_signatures/{uuid}', { pathParams: { uuid } });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_ips_signature',
    {
      description: 'Update an IPS signature object by UUID.',
      inputSchema: { uuid: z.string(), body: jsonBody },
    },
    async ({ uuid, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/ips_signatures/{uuid}', {
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
    'sdcloud_delete_ips_signature',
    {
      description: 'Delete an IPS signature object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/ips_signatures/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}

/**
 * Read-only reference list for /api/v1/ips_signature_categories. Per the spec this endpoint
 * only supports GET (list) with from/size params — there is no get-by-id and no write methods.
 */
export function registerIpsSignatureCategoryTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_ips_signature_categories',
    {
      description: 'List available IPS signature categories (read-only reference data).',
      inputSchema: {
        from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
        size: z.string().optional().describe('Max results per page.'),
      },
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_signature_categories', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}

/**
 * Read-only reference list for /api/v1/ips_anomaly_tests. Per the spec this endpoint only
 * supports GET (list) with from/size/service params — there is no get-by-id and no write
 * methods.
 */
export function registerIpsAnomalyTestTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_ips_anomaly_tests',
    {
      description: 'List available IPS anomaly tests (read-only reference data), optionally filtered by service.',
      inputSchema: {
        from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
        size: z.string().optional().describe('Max results per page.'),
        service: z.string().optional().describe('Filter anomaly tests by service.'),
      },
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_anomaly_tests', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
