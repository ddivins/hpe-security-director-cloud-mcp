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
 * Registers tools for /api/v1/device_image_definitions. Note the spec exposes no GET-by-id for a
 * single image definition (only list/create/delete). Image deployment/staging comes in two
 * shapes: bulk (POST .../deploy_image with a body listing targets, status polled via
 * .../deploy_image/{deploy_image_id}) and single-image (POST .../{image_uuid}/deploy_image or
 * .../{image_uuid}/stage_image, acting on one image definition at a time). Staging has no bulk
 * variant in the spec, only the single-image POST and its .../stage_image/{stage_image_id}
 * status endpoint.
 */
export function registerDeviceImageTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_device_image_definitions',
    {
      description: 'List device software image definitions with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/device_image_definitions', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_device_image_definition',
    {
      description: 'Create a new device software image definition.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/device_image_definitions', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_device_image_definition',
    {
      description: 'Delete a device software image definition by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/device_image_definitions/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_bulk_deploy_device_image',
    {
      description: 'Bulk-deploy a software image to multiple devices. Returns a job id; poll sdcloud_get_deploy_image_status for progress.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/device_image_definitions/deploy_image', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_deploy_image_status',
    {
      description: 'Get the status of a bulk device-image deploy job.',
      inputSchema: { deploy_image_id: z.string() },
    },
    async ({ deploy_image_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/device_image_definitions/deploy_image/{deploy_image_id}',
          { pathParams: { deploy_image_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_stage_image_status',
    {
      description: 'Get the status of a device-image staging job.',
      inputSchema: { stage_image_id: z.string() },
    },
    async ({ stage_image_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/device_image_definitions/stage_image/{stage_image_id}',
          { pathParams: { stage_image_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_deploy_device_image',
    {
      description: 'Deploy a single software image definition to its target device(s). Returns a job id; poll sdcloud_get_deploy_image_status for progress.',
      inputSchema: { image_uuid: z.string(), body: jsonBody },
    },
    async ({ image_uuid, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/device_image_definitions/{image_uuid}/deploy_image',
          { pathParams: { image_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_stage_device_image',
    {
      description: 'Stage (pre-position) a single software image definition on its target device(s) without activating it. Returns a job id; poll sdcloud_get_stage_image_status for progress.',
      inputSchema: { image_uuid: z.string(), body: jsonBody },
    },
    async ({ image_uuid, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/device_image_definitions/{image_uuid}/stage_image',
          { pathParams: { image_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
