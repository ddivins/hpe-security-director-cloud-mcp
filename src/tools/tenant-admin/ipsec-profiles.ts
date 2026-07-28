import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

export function registerIpsecProfileTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_create_ipsec_profile',
    {
      description: 'Create a new IPsec profile.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/ipsec-profile', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ipsec_profile',
    {
      description: 'Get an IPsec profile by name.',
      inputSchema: { profile_name: z.string() },
    },
    async ({ profile_name }) => {
      try {
        const data = await client.request('GET', '/api/v2/ipsec-profile/{profile_name}', {
          pathParams: { profile_name },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_ipsec_profile',
    {
      description: 'Delete an IPsec profile by name.',
      inputSchema: { profile_name: z.string() },
    },
    async ({ profile_name }) => {
      try {
        const data = await client.request('DELETE', '/api/v2/ipsec-profile/{profile_name}', {
          pathParams: { profile_name },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_ipsec_profile',
    {
      description: 'Update an IPsec profile by name.',
      inputSchema: { profile_name: z.string(), body: jsonBody },
    },
    async ({ profile_name, body }) => {
      try {
        const data = await client.request('PUT', '/api/v2/ipsec-profile/{profile_name}', {
          pathParams: { profile_name },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_ipsec_profiles',
    {
      description: 'List all IPsec profiles. This endpoint does not support pagination params.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v2/ipsec-profiles');
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
