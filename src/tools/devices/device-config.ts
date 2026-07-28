import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

/** Shared pagination/filter params used by the device config sub-resource GET endpoints. */
const configListParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filter: z.string().optional().describe('Filter condition to apply to the results.'),
};

/**
 * Registers read-only tools for a device's live/running configuration sub-resources under
 * /api/v1/devices/{device_uuid}/config/*: idp_sensors, interfaces (+ nested subinterfaces),
 * latest_version, routing_instances, subinterfaces, zones. All endpoints are GET-only.
 */
export function registerDeviceConfigTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_device_config_idp_sensors',
    {
      description: "List a device's configured IDP sensors.",
      inputSchema: { device_uuid: z.string(), ...configListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/config/idp_sensors', {
          pathParams: { device_uuid },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device_config_interfaces',
    {
      description: "List a device's configured interfaces.",
      inputSchema: { device_uuid: z.string(), ...configListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/config/interfaces', {
          pathParams: { device_uuid },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device_interface_subinterfaces',
    {
      description: 'List subinterfaces configured under a specific interface on a device.',
      inputSchema: { device_uuid: z.string(), interface_name: z.string(), ...configListParams },
    },
    async ({ device_uuid, interface_name, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/devices/{device_uuid}/config/interfaces/{interface_name}/subinterfaces',
          { pathParams: { device_uuid, interface_name }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device_config_latest_version',
    {
      description: "Get metadata for a device's latest configuration revision.",
      inputSchema: { device_uuid: z.string() },
    },
    async ({ device_uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/config/latest_version', {
          pathParams: { device_uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device_config_routing_instances',
    {
      description: "List a device's configured routing instances.",
      inputSchema: { device_uuid: z.string(), ...configListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/config/routing_instances', {
          pathParams: { device_uuid },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device_config_subinterfaces',
    {
      description: "List all of a device's configured subinterfaces.",
      inputSchema: { device_uuid: z.string(), ...configListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/config/subinterfaces', {
          pathParams: { device_uuid },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_device_config_zones',
    {
      description: "List a device's configured security zones.",
      inputSchema: { device_uuid: z.string(), ...configListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/config/zones', {
          pathParams: { device_uuid },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
