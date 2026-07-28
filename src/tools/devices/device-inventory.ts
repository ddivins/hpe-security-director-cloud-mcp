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
 * Registers tools for /api/v1/devices core inventory operations: listing, creation, retrieval,
 * bulk remove/reboot/sync (each with an async job-status GET-by-id sibling), bootstrap config
 * generation, and device configuration version history/rollback.
 */
export function registerDeviceInventoryTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_devices',
    {
      description: 'List onboarded devices with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/devices', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_device',
    {
      description: 'Bulk-create (onboard) one or more devices. Body typically includes a list of device definitions.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/create', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device',
    {
      description: 'Get a single device by UUID.',
      inputSchema: { device_uuid: z.string() },
    },
    async ({ device_uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}', {
          pathParams: { device_uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_remove_devices',
    {
      description: 'Bulk-remove devices. Body typically includes a list of device UUIDs to remove. Returns a job id; poll sdcloud_get_remove_devices_status for progress.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/remove', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_remove_devices_status',
    {
      description: 'Get the status of a bulk device-remove job.',
      inputSchema: { remove_id: z.string() },
    },
    async ({ remove_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/remove/{remove_id}', {
          pathParams: { remove_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_reboot_devices',
    {
      description: 'Bulk-reboot devices. Body typically includes a list of device UUIDs. Returns a job id; poll sdcloud_get_reboot_devices_status for progress.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/reboot', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_reboot_devices_status',
    {
      description: 'Get the status of a bulk device-reboot job.',
      inputSchema: { reboot_id: z.string() },
    },
    async ({ reboot_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/reboot/{reboot_id}', {
          pathParams: { reboot_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_sync_devices',
    {
      description: 'Bulk-sync devices with the controller. Body typically includes a list of device UUIDs. Returns a job id; poll sdcloud_get_sync_devices_status for progress.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/sync', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_sync_devices_status',
    {
      description: 'Get the status of a bulk device-sync job.',
      inputSchema: { sync_id: z.string() },
    },
    async ({ sync_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/sync/{sync_id}', {
          pathParams: { sync_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device_bootstrap_config',
    {
      description: 'Generate/retrieve the bootstrap configuration for a device.',
      inputSchema: { device_uuid: z.string(), body: jsonBody },
    },
    async ({ device_uuid, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/{device_uuid}/get_bootstrap_config', {
          pathParams: { device_uuid },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_device_config_versions',
    {
      description: 'List configuration version history for a device.',
      inputSchema: { device_uuid: z.string() },
    },
    async ({ device_uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/config/versions', {
          pathParams: { device_uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_rollback_device_config_version',
    {
      description: 'Trigger a rollback of a device to a prior configuration version. Returns a job id; poll sdcloud_get_config_rollback_status for progress.',
      inputSchema: { device_uuid: z.string(), version_number: z.string() },
    },
    async ({ device_uuid, version_number }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/devices/{device_uuid}/config/versions/{version_number}/rollback',
          { pathParams: { device_uuid, version_number } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_config_rollback_status',
    {
      description: 'Get the status of a device configuration rollback job.',
      inputSchema: { config_rollback_id: z.string() },
    },
    async ({ config_rollback_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/config/rollback/{config_rollback_id}', {
          pathParams: { config_rollback_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
