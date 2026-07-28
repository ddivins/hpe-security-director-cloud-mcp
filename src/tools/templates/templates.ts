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

/** /api/v1/templates/{template_id}/mappings/devices list params (spec has no `fields`). */
const mappingListParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filters: z.string().optional().describe('Filter conditions to apply to the results.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
  count: z.boolean().optional().describe('If true, return only the total count, no item details.'),
};

/** Decodes a base64 string into a Buffer, ready to wrap as a Blob for multipart form fields. */
function decodeBase64(fileContent: string): Buffer {
  return Buffer.from(fileContent, 'base64');
}

/**
 * Registers tools for /api/v1/templates: configuration template CRUD (list/get/delete only —
 * the spec exposes no create/update at the collection or item root), the deploy/preview/validate
 * trio (each an async POST that returns a job id, polled via a sibling /templates/{op}/{id} and
 * a further per-device /templates/{op}/{id}/devices/{device_id} breakdown), CSV parameter-mapping
 * download/upload (upload is multipart/form-data), device-to-template mapping CRUD, and workflow
 * definition upload (multipart/form-data, a template-independent endpoint at
 * /api/v1/templates/workflow_definitions).
 */
export function registerTemplateTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_templates',
    {
      description: 'List configuration templates with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/templates', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template',
    {
      description: 'Get a configuration template by id.',
      inputSchema: { template_id: z.string() },
    },
    async ({ template_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/{template_id}', {
          pathParams: { template_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_template',
    {
      description: 'Delete a configuration template by id.',
      inputSchema: { template_id: z.string() },
    },
    async ({ template_id }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/templates/{template_id}', {
          pathParams: { template_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_deploy_template',
    {
      description: 'Deploy a configuration template to its mapped devices. Returns a job id; poll sdcloud_get_template_deploy_status for progress.',
      inputSchema: { template_id: z.string(), body: jsonBody },
    },
    async ({ template_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/templates/{template_id}/deploy', {
          pathParams: { template_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template_deploy_status',
    {
      description: 'Get the overall status of a template deploy job.',
      inputSchema: { deploy_id: z.string() },
    },
    async ({ deploy_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/deploy/{deploy_id}', {
          pathParams: { deploy_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template_deploy_result_by_device',
    {
      description: 'Get the per-device result of a template deploy job.',
      inputSchema: { deploy_id: z.string(), device_id: z.string() },
    },
    async ({ deploy_id, device_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/deploy/{deploy_id}/devices/{device_id}', {
          pathParams: { deploy_id, device_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_preview_template',
    {
      description: 'Preview the configuration a template deployment would produce. Returns a job id; poll sdcloud_get_template_preview_status for progress.',
      inputSchema: { template_id: z.string(), body: jsonBody },
    },
    async ({ template_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/templates/{template_id}/preview', {
          pathParams: { template_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template_preview_status',
    {
      description: 'Get the overall status of a template preview job.',
      inputSchema: { preview_id: z.string() },
    },
    async ({ preview_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/preview/{preview_id}', {
          pathParams: { preview_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template_preview_result_by_device',
    {
      description: 'Get the per-device result of a template preview job.',
      inputSchema: { preview_id: z.string(), device_id: z.string() },
    },
    async ({ preview_id, device_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/preview/{preview_id}/devices/{device_id}', {
          pathParams: { preview_id, device_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_validate_template',
    {
      description: 'Validate a configuration template against its mapped devices. Returns a job id; poll sdcloud_get_template_validate_status for progress.',
      inputSchema: { template_id: z.string(), body: jsonBody },
    },
    async ({ template_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/templates/{template_id}/validate', {
          pathParams: { template_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template_validate_status',
    {
      description: 'Get the overall status of a template validate job.',
      inputSchema: { validate_id: z.string() },
    },
    async ({ validate_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/validate/{validate_id}', {
          pathParams: { validate_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template_validate_result_by_device',
    {
      description: 'Get the per-device result of a template validate job.',
      inputSchema: { validate_id: z.string(), device_id: z.string() },
    },
    async ({ validate_id, device_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/templates/validate/{validate_id}/devices/{device_id}',
          { pathParams: { validate_id, device_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_download_template_csv',
    {
      description:
        'Download the CSV device-parameter mapping file for a template. Body typically selects which devices/mappings to include. The response is passed through as-is (file content or a reference to it, per the API).',
      inputSchema: { template_id: z.string(), body: jsonBody },
    },
    async ({ template_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/templates/{template_id}/csv/download', {
          pathParams: { template_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_upload_template_csv',
    {
      description:
        'Upload a CSV file of device parameter mappings for a template (multipart upload). Provide the CSV content base64-encoded.',
      inputSchema: {
        template_id: z.string(),
        file_content: z.string().describe('Base64-encoded CSV file content.'),
        file_name: z.string().optional().describe('Filename to report for the uploaded CSV file.'),
      },
    },
    async ({ template_id, file_content, file_name }) => {
      try {
        const form = new FormData();
        form.append('device_params_file', new Blob([decodeBase64(file_content)]), file_name ?? 'device_params.csv');
        const data = await client.requestMultipart('POST', '/api/v1/templates/{template_id}/csv/upload', {
          pathParams: { template_id },
          form,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_batch_save_template_mappings',
    {
      description: 'Batch-create/update device-to-template variable mappings for a template.',
      inputSchema: { template_id: z.string(), body: jsonBody },
    },
    async ({ template_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/templates/{template_id}/mappings/batch', {
          pathParams: { template_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_template_mappings',
    {
      description: 'List device mappings for a template, with optional pagination, filtering, and sorting.',
      inputSchema: { template_id: z.string(), ...mappingListParams },
    },
    async ({ template_id, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/{template_id}/mappings/devices', {
          pathParams: { template_id },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_template_mapping',
    {
      description: 'Get a single device mapping for a template.',
      inputSchema: { template_id: z.string(), device_id: z.string() },
    },
    async ({ template_id, device_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/templates/{template_id}/mappings/devices/{device_id}', {
          pathParams: { template_id, device_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_template_mapping',
    {
      description: 'Delete a device mapping for a template.',
      inputSchema: { template_id: z.string(), device_id: z.string() },
    },
    async ({ template_id, device_id }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/templates/{template_id}/mappings/devices/{device_id}',
          { pathParams: { template_id, device_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_template_mapping',
    {
      description: 'Update a device mapping for a template.',
      inputSchema: { template_id: z.string(), device_id: z.string(), body: jsonBody },
    },
    async ({ template_id, device_id, body }) => {
      try {
        const data = await client.request(
          'PUT',
          '/api/v1/templates/{template_id}/mappings/devices/{device_id}',
          { pathParams: { template_id, device_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_upload_template_workflow_definition',
    {
      description:
        'Upload a workflow definition YAML file to create/register a new template (multipart upload). Provide the YAML content base64-encoded.',
      inputSchema: {
        file_content: z.string().describe('Base64-encoded workflow definition YAML file content.'),
        file_name: z.string().optional().describe('Filename to report for the uploaded definition file.'),
      },
    },
    async ({ file_content, file_name }) => {
      try {
        const form = new FormData();
        form.append('definition_file', new Blob([decodeBase64(file_content)]), file_name ?? 'workflow_definition.yaml');
        const data = await client.requestMultipart('POST', '/api/v1/templates/workflow_definitions', { form });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
