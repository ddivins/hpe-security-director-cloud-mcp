import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

/**
 * Singleton resource (GET/PUT only, no id) for /api/v1/firewall_global_profiles.
 */
export function registerFirewallGlobalProfileTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_firewall_global_profiles',
    {
      description: 'Get the tenant-wide firewall global profile singleton.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v1/firewall_global_profiles', {});
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_set_firewall_global_profiles',
    {
      description: 'Update the tenant-wide firewall global profile singleton.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/firewall_global_profiles', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}

/**
 * Singleton resource (GET/PUT only, no id) for /api/v1/firewall_global_settings.
 */
export function registerFirewallGlobalSettingsTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_firewall_global_settings',
    {
      description: 'Get the tenant-wide firewall global settings singleton.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v1/firewall_global_settings', {});
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_set_firewall_global_settings',
    {
      description: 'Update the tenant-wide firewall global settings singleton.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/firewall_global_settings', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}

/**
 * Flat 5-op CRUD for /api/v1/firewall_device_global_settings.
 *
 * Note: unlike most flat security-object resources, this resource's list endpoint does NOT
 * use the standard from/size/filters/sortby/count params. Per the spec it takes
 * device_id/offset/limit instead.
 */
export function registerFirewallDeviceGlobalSettingsTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_firewall_device_global_settings',
    {
      description: 'List per-device firewall global settings with optional filtering and pagination.',
      inputSchema: {
        device_id: z.string().optional().describe('Filter by device UUID.'),
        offset: z.string().optional().describe('Starting index for pagination (zero-based).'),
        limit: z.string().optional().describe('Max results per page.'),
      },
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/firewall_device_global_settings', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_firewall_device_global_settings',
    {
      description: 'Create a new per-device firewall global settings object.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/firewall_device_global_settings', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_firewall_device_global_settings',
    {
      description: 'Get a per-device firewall global settings object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/firewall_device_global_settings/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_firewall_device_global_settings',
    {
      description: 'Update a per-device firewall global settings object by UUID.',
      inputSchema: { uuid: z.string(), body: jsonBody },
    },
    async ({ uuid, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/firewall_device_global_settings/{uuid}', {
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
    'sdcloud_delete_firewall_device_global_settings',
    {
      description: 'Delete a per-device firewall global settings object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/firewall_device_global_settings/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
