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

// Nested exempt_rules/ips_rules list endpoints only support from/size/sortby/filters per the
// spec (no fields/obj_uuids/count).
const nestedListParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
  filters: z.string().optional().describe('Filter conditions to apply to the results.'),
};

/**
 * Registers tools for /api/v1/ips_profiles and its two independently-nested child collections,
 * exempt_rules and ips_rules (2-level nesting, not 3 — both live directly under
 * {profile_uuid}, unlike firewall-policies.ts's rule_groups -> rules chain).
 */
export function registerIpsProfileTools(server: McpServer, client: SdCloudClient) {
  // --- ips_profiles: flat 5-op CRUD ---

  server.registerTool(
    'sdcloud_list_ips_profiles',
    {
      description: 'List IPS profile objects with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_profiles', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_ips_profile',
    {
      description: 'Create a new IPS profile object.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/ips_profiles', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ips_profile',
    {
      description: 'Get an IPS profile object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_profiles/{uuid}', { pathParams: { uuid } });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_ips_profile',
    {
      description: 'Update an IPS profile object by UUID.',
      inputSchema: { uuid: z.string(), body: jsonBody },
    },
    async ({ uuid, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/ips_profiles/{uuid}', {
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
    'sdcloud_delete_ips_profile',
    {
      description: 'Delete an IPS profile object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/ips_profiles/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  // --- exempt_rules: nested under {profile_uuid}, flat 5-op CRUD ---

  server.registerTool(
    'sdcloud_list_ips_profile_exempt_rules',
    {
      description: 'List exempt rules within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), ...nestedListParams },
    },
    async ({ profile_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_profiles/{profile_uuid}/exempt_rules', {
          pathParams: { profile_uuid },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_ips_profile_exempt_rule',
    {
      description: 'Create an exempt rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), body: jsonBody },
    },
    async ({ profile_uuid, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/ips_profiles/{profile_uuid}/exempt_rules', {
          pathParams: { profile_uuid },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ips_profile_exempt_rule',
    {
      description: 'Get an exempt rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), rule_uuid: z.string() },
    },
    async ({ profile_uuid, rule_uuid }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/ips_profiles/{profile_uuid}/exempt_rules/{rule_uuid}',
          { pathParams: { profile_uuid, rule_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_ips_profile_exempt_rule',
    {
      description: 'Update an exempt rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), rule_uuid: z.string(), body: jsonBody },
    },
    async ({ profile_uuid, rule_uuid, body }) => {
      try {
        const data = await client.request(
          'PUT',
          '/api/v1/ips_profiles/{profile_uuid}/exempt_rules/{rule_uuid}',
          { pathParams: { profile_uuid, rule_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_ips_profile_exempt_rule',
    {
      description: 'Delete an exempt rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), rule_uuid: z.string() },
    },
    async ({ profile_uuid, rule_uuid }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/ips_profiles/{profile_uuid}/exempt_rules/{rule_uuid}',
          { pathParams: { profile_uuid, rule_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  // --- ips_rules: nested under {profile_uuid}, flat 5-op CRUD ---

  server.registerTool(
    'sdcloud_list_ips_profile_rules',
    {
      description: 'List IPS rules within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), ...nestedListParams },
    },
    async ({ profile_uuid, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_profiles/{profile_uuid}/ips_rules', {
          pathParams: { profile_uuid },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_ips_profile_rule',
    {
      description: 'Create an IPS rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), body: jsonBody },
    },
    async ({ profile_uuid, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/ips_profiles/{profile_uuid}/ips_rules', {
          pathParams: { profile_uuid },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_ips_profile_rule',
    {
      description: 'Get an IPS rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), rule_uuid: z.string() },
    },
    async ({ profile_uuid, rule_uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/ips_profiles/{profile_uuid}/ips_rules/{rule_uuid}', {
          pathParams: { profile_uuid, rule_uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_ips_profile_rule',
    {
      description: 'Update an IPS rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), rule_uuid: z.string(), body: jsonBody },
    },
    async ({ profile_uuid, rule_uuid, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/ips_profiles/{profile_uuid}/ips_rules/{rule_uuid}', {
          pathParams: { profile_uuid, rule_uuid },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_ips_profile_rule',
    {
      description: 'Delete an IPS rule within an IPS profile.',
      inputSchema: { profile_uuid: z.string(), rule_uuid: z.string() },
    },
    async ({ profile_uuid, rule_uuid }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/ips_profiles/{profile_uuid}/ips_rules/{rule_uuid}',
          { pathParams: { profile_uuid, rule_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
