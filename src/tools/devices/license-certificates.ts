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

/** Per-device cert/license list params (no `count` in the spec for these nested endpoints). */
const deviceListParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filters: z.string().optional().describe('Filter conditions to apply to the results.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
};

/** Decodes a base64 string into a Buffer, ready to wrap as a Blob for multipart form fields. */
function decodeBase64(fileContent: string): Buffer {
  return Buffer.from(fileContent, 'base64');
}

/**
 * Registers tools for device-scoped license and certificate management under
 * /api/v1/devices/*: fleet-wide CA/local certificate listings, async job-status polling for
 * certificate/license installs and deletes, and per-device certificate/license CRUD. The three
 * install_* endpoints are multipart/form-data; per the spec's requestBody schema at each path,
 * field names and required companion fields differ per endpoint (see inline comments), so each
 * gets a purpose-built Zod input rather than a single generic file_content/file_name shape.
 */
export function registerLicenseCertificateTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_ca_certificates',
    {
      description: 'List CA certificates across the fleet, with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/ca_certificates', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_local_certificates',
    {
      description: 'List local certificates across the fleet, with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/local_certificates', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_delete_certificate_status',
    {
      description: 'Get the status of a certificate-delete job.',
      inputSchema: { delete_certificate_id: z.string() },
    },
    async ({ delete_certificate_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/delete_certificate/{delete_certificate_id}', {
          pathParams: { delete_certificate_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_install_ca_certificate_status',
    {
      description: 'Get the status of a CA certificate installation job.',
      inputSchema: { install_ca_certificate_id: z.string() },
    },
    async ({ install_ca_certificate_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/devices/install_ca_certificate/{install_ca_certificate_id}',
          { pathParams: { install_ca_certificate_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_install_license_status',
    {
      description: 'Get the status of a license installation job.',
      inputSchema: { install_license_id: z.string() },
    },
    async ({ install_license_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/install_license/{install_license_id}', {
          pathParams: { install_license_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_install_local_certificate_status',
    {
      description: 'Get the status of a local certificate installation job.',
      inputSchema: { install_local_certificate_id: z.string() },
    },
    async ({ install_local_certificate_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/devices/install_local_certificate/{install_local_certificate_id}',
          { pathParams: { install_local_certificate_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_device_ca_certificates',
    {
      description: 'List CA certificates installed on a specific device.',
      inputSchema: { device_uuid: z.string(), ...deviceListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/ca_certificates', {
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
    'sdcloud_list_device_local_certificates',
    {
      description: 'List local certificates installed on a specific device.',
      inputSchema: { device_uuid: z.string(), ...deviceListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/local_certificates', {
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
    'sdcloud_list_device_licenses',
    {
      description: 'List licenses installed on a specific device.',
      inputSchema: { device_uuid: z.string(), ...deviceListParams },
    },
    async ({ device_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/licenses', {
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
    'sdcloud_get_device_license',
    {
      description: 'Get a single license installed on a device.',
      inputSchema: { device_uuid: z.string(), license_uuid: z.string() },
    },
    async ({ device_uuid, license_uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/devices/{device_uuid}/licenses/{license_uuid}', {
          pathParams: { device_uuid, license_uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_device_certificate',
    {
      description: 'Delete a certificate from a device. Body typically includes the certificate id/type to remove.',
      inputSchema: { device_uuid: z.string(), body: jsonBody },
    },
    async ({ device_uuid, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/devices/{device_uuid}/delete_certificate', {
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
    'sdcloud_install_device_ca_certificate',
    {
      description:
        'Install a CA certificate on a device (multipart upload). Provide the certificate file as base64 in ca_certificate_content, plus the CA profile id to associate it with.',
      inputSchema: {
        device_uuid: z.string(),
        ca_profile_id: z.string().describe('Unique identifier of the CA profile to associate with the installed certificate.'),
        ca_certificate_content: z.string().describe('Base64-encoded CA certificate file content.'),
        ca_certificate_file_name: z.string().optional().describe('Filename to report for the uploaded certificate file.'),
      },
    },
    async ({ device_uuid, ca_profile_id, ca_certificate_content, ca_certificate_file_name }) => {
      try {
        const form = new FormData();
        form.append('ca_profile_id', ca_profile_id);
        form.append(
          'ca_certificate',
          new Blob([decodeBase64(ca_certificate_content)]),
          ca_certificate_file_name ?? 'ca_certificate',
        );
        const data = await client.requestMultipart('POST', '/api/v1/devices/{device_uuid}/install_ca_certificate', {
          pathParams: { device_uuid },
          form,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_install_device_license',
    {
      description:
        'Install a license on a device (multipart upload). Provide at least one of a primary license file (license_file_content) or, for an l2_cluster secondary device, a secondary license file (secondary_license_file_content), each base64-encoded.',
      inputSchema: {
        device_uuid: z.string(),
        license_file_content: z.string().optional().describe('Base64-encoded license text file content for a standalone device.'),
        license_file_name: z.string().optional().describe('Filename to report for the primary license file.'),
        secondary_license_file_content: z.string().optional().describe('Base64-encoded license text file content for the secondary device in an l2_cluster.'),
        secondary_license_file_name: z.string().optional().describe('Filename to report for the secondary license file.'),
      },
    },
    async ({
      device_uuid,
      license_file_content,
      license_file_name,
      secondary_license_file_content,
      secondary_license_file_name,
    }) => {
      try {
        const form = new FormData();
        if (license_file_content) {
          form.append(
            'license_file',
            new Blob([decodeBase64(license_file_content)]),
            license_file_name ?? 'license_file',
          );
        }
        if (secondary_license_file_content) {
          form.append(
            'secondary_license_file',
            new Blob([decodeBase64(secondary_license_file_content)]),
            secondary_license_file_name ?? 'secondary_license_file',
          );
        }
        const data = await client.requestMultipart('POST', '/api/v1/devices/{device_uuid}/install_license', {
          pathParams: { device_uuid },
          form,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_install_device_local_certificate',
    {
      description:
        'Install a local certificate and its private key on a device (multipart upload). Provide the certificate id to associate, the certificate and key files as base64, and the pass phrase used to encrypt the key file.',
      inputSchema: {
        device_uuid: z.string(),
        certificate_id: z.string().describe('Unique identifier of the certificate to associate with the installed local certificate.'),
        local_certificate_content: z.string().describe('Base64-encoded local certificate file content.'),
        local_certificate_file_name: z.string().optional().describe('Filename to report for the certificate file.'),
        local_certificate_key_file_content: z.string().describe('Base64-encoded private key file content corresponding to the local certificate.'),
        local_certificate_key_file_name: z.string().optional().describe('Filename to report for the private key file.'),
        pass_phrase: z.string().describe('Pass phrase used to encrypt/decrypt the private key file.'),
      },
    },
    async ({
      device_uuid,
      certificate_id,
      local_certificate_content,
      local_certificate_file_name,
      local_certificate_key_file_content,
      local_certificate_key_file_name,
      pass_phrase,
    }) => {
      try {
        const form = new FormData();
        form.append('certificate_id', certificate_id);
        form.append('pass_phrase', pass_phrase);
        form.append(
          'local_certificate',
          new Blob([decodeBase64(local_certificate_content)]),
          local_certificate_file_name ?? 'local_certificate',
        );
        form.append(
          'local_certificate_key_file',
          new Blob([decodeBase64(local_certificate_key_file_content)]),
          local_certificate_key_file_name ?? 'local_certificate_key_file',
        );
        const data = await client.requestMultipart(
          'POST',
          '/api/v1/devices/{device_uuid}/install_local_certificate',
          { pathParams: { device_uuid }, form },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
