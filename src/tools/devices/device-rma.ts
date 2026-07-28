import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

/**
 * Registers tools for the Return Merchandise Authorization (RMA) workflow: putting a device into
 * RMA state, reactivating a replacement device against a prior device's config, and checking
 * RMA/reactivation status.
 */
export function registerDeviceRmaTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_rma_reactivation_status',
    {
      description: 'Get the status of an RMA device-reactivation job.',
      inputSchema: { reactivation_id: z.string() },
    },
    async ({ reactivation_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/rma/reactivate/{reactivation_id}', {
          pathParams: { reactivation_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_activate_rma_device',
    {
      description: 'Put a device into RMA (Return Merchandise Authorization) state.',
      inputSchema: { device_id: z.string(), body: jsonBody },
    },
    async ({ device_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/{device_id}/rma/activate', {
          pathParams: { device_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_reactivate_rma_device',
    {
      description: 'Reactivate a replacement device with the configuration of a prior RMA device. Returns a job id; poll sdcloud_get_rma_reactivation_status for progress.',
      inputSchema: { device_id: z.string(), body: jsonBody },
    },
    async ({ device_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/{device_id}/rma/reactivate', {
          pathParams: { device_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_rma_reactivation_config',
    {
      description: 'Get the reactivation configuration for a device that is in RMA state.',
      inputSchema: { device_id: z.string() },
    },
    async ({ device_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_id}/rma/reactivation_config', {
          pathParams: { device_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_set_rma_reactivation_preferences',
    {
      description: 'Set up an RMA device with reactivation preferences for the replacement workflow.',
      inputSchema: { device_id: z.string(), body: jsonBody },
    },
    async ({ device_id, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/devices/{device_id}/rma/reactivation_preferences',
          { pathParams: { device_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_rma_device_state',
    {
      description: 'Get the current RMA state of a device.',
      inputSchema: { device_id: z.string() },
    },
    async ({ device_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_id}/rma/state', {
          pathParams: { device_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
