import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

/**
 * /api/v2/* list endpoints use `spec.size`/`spec.from` query params only — no filters,
 * sortby, or count support, unlike the /api/v1 listParams pattern.
 */
const v2ListParams = {
  'spec.size': z.string().optional().describe('Max results per page.'),
  'spec.from': z.string().optional().describe('Starting index for pagination (zero-based).'),
};

export function registerIamTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_create_user',
    {
      description: 'Create a new user.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/user', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_user',
    {
      description: 'Get a user by user_id.',
      inputSchema: { user_id: z.string() },
    },
    async ({ user_id }) => {
      try {
        const data = await client.request('GET', '/api/v2/user/{user_id}', {
          pathParams: { user_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_user',
    {
      description: 'Update a user by user_id.',
      inputSchema: { user_id: z.string(), body: jsonBody },
    },
    async ({ user_id, body }) => {
      try {
        const data = await client.request('PUT', '/api/v2/user/{user_id}', {
          pathParams: { user_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_user',
    {
      description:
        'Delete a user by uuid. Note: unlike get/update, the API spec names this path param "uuid" rather than "user_id".',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v2/user/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_users',
    {
      description: 'List users with optional spec.size/spec.from pagination.',
      inputSchema: v2ListParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v2/users', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_role',
    {
      description: 'Get a role by ID.',
      inputSchema: { ID: z.string() },
    },
    async ({ ID }) => {
      try {
        const data = await client.request('GET', '/api/v2/role/{ID}', {
          pathParams: { ID },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_roles',
    {
      description: 'List roles with optional spec.size/spec.from pagination.',
      inputSchema: v2ListParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v2/roles', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_change_password',
    {
      description:
        'WARNING: Sensitive/destructive-ish action. Changes the password of the currently authenticated user. This immediately invalidates the old credentials for that account — confirm intent before calling.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/change-password', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_send_activate_user_email',
    {
      description: 'Send an account activation email to a user.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v2/send-activate-user-email', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_tenant_pop_users_count',
    {
      description: 'Get the count of users for a given tenant POP.',
      inputSchema: { tenant_pop_id: z.string() },
    },
    async ({ tenant_pop_id }) => {
      try {
        const data = await client.request('GET', '/api/v2/{tenant_pop_id}/users/count', {
          pathParams: { tenant_pop_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
