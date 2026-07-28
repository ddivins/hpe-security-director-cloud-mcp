import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const listParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filters: z.string().optional().describe('Filter conditions to apply to the results.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
  count: z.boolean().optional().describe('If true, return only the total count, no item details.'),
};

/**
 * Read-only reference data for /api/v1/ips_contexts. List + get-by-id only, no write methods
 * per the spec.
 */
export function registerIpsContextTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_ips_contexts',
    {
      description: 'List IPS contexts (read-only reference data) with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_contexts', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ips_context',
    {
      description: 'Get an IPS context by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_contexts/{uuid}', { pathParams: { uuid } });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}

/**
 * Read-only reference data for /api/v1/ips_services. List + get-by-id only, no write methods
 * per the spec.
 */
export function registerIpsServiceTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_ips_services',
    {
      description: 'List IPS services (read-only reference data) with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_services', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ips_service',
    {
      description: 'Get an IPS service by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_services/{uuid}', { pathParams: { uuid } });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}

/**
 * Read-only reference data for /api/v1/ips_vulnerabilities. List + get-by-id only, no write
 * methods per the spec.
 */
export function registerIpsVulnerabilityTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_ips_vulnerabilities',
    {
      description:
        'List IPS vulnerabilities (read-only reference data) with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_vulnerabilities', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ips_vulnerability',
    {
      description: 'Get an IPS vulnerability by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_vulnerabilities/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
