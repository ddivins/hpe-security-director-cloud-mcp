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

// Nested rule_sets/rules list endpoints additionally accept parent_type per the spec.
const nestedListParams = {
  ...listParams,
  parent_type: z.string().optional().describe('Filter by parent object type.'),
};

/**
 * Registers tools for /api/v1/enhanced_content_filtering_profiles and its 2-level nested
 * rule_sets -> rules resources.
 *
 * Shape verified against the spec:
 *  - enhanced_content_filtering_profiles: list, create, get, update, delete (flat 5-op CRUD).
 *  - .../{profile_uuid}/rule_sets: list, create only.
 *  - .../{profile_uuid}/rule_sets/{uuid}: delete only (no get/update for a rule_set itself).
 *  - .../{profile_uuid}/rule_sets/{rule_set_uuid}/rules: list, create.
 *  - .../{profile_uuid}/rule_sets/{rule_set_uuid}/rules/{uuid}: get, update, delete.
 */
export function registerEnhancedContentFilteringProfileTools(server: McpServer, client: SdCloudClient) {
  // --- Profile: flat 5-op CRUD ---

  server.registerTool(
    'sdcloud_list_enhanced_content_filtering_profiles',
    {
      description:
        'List enhanced content filtering profile objects with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/enhanced_content_filtering_profiles', {
          query: args,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_enhanced_content_filtering_profile',
    {
      description: 'Create a new enhanced content filtering profile object.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/enhanced_content_filtering_profiles', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_enhanced_content_filtering_profile',
    {
      description: 'Get an enhanced content filtering profile object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/enhanced_content_filtering_profiles/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_enhanced_content_filtering_profile',
    {
      description: 'Update an enhanced content filtering profile object by UUID.',
      inputSchema: { uuid: z.string(), body: jsonBody },
    },
    async ({ uuid, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/enhanced_content_filtering_profiles/{uuid}', {
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
    'sdcloud_delete_enhanced_content_filtering_profile',
    {
      description: 'Delete an enhanced content filtering profile object by UUID.',
      inputSchema: { uuid: z.string() },
    },
    async ({ uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/enhanced_content_filtering_profiles/{uuid}', {
          pathParams: { uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  // --- rule_sets: list, create, delete only (no get/update) ---

  server.registerTool(
    'sdcloud_list_enhanced_content_filtering_rule_sets',
    {
      description: 'List rule sets within an enhanced content filtering profile.',
      inputSchema: { profile_uuid: z.string(), ...nestedListParams },
    },
    async ({ profile_uuid, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets',
          { pathParams: { profile_uuid }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_enhanced_content_filtering_rule_set',
    {
      description: 'Create a rule set within an enhanced content filtering profile.',
      inputSchema: { profile_uuid: z.string(), body: jsonBody },
    },
    async ({ profile_uuid, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets',
          { pathParams: { profile_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_enhanced_content_filtering_rule_set',
    {
      description:
        'Delete a rule set within an enhanced content filtering profile. There is no get/update for a rule set itself (only its nested rules support get/update).',
      inputSchema: { profile_uuid: z.string(), uuid: z.string() },
    },
    async ({ profile_uuid, uuid }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets/{uuid}',
          { pathParams: { profile_uuid, uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  // --- rules: nested under rule_sets, flat 5-op CRUD ---

  server.registerTool(
    'sdcloud_list_enhanced_content_filtering_rules',
    {
      description: 'List rules within an enhanced content filtering profile rule set.',
      inputSchema: { profile_uuid: z.string(), rule_set_uuid: z.string(), ...nestedListParams },
    },
    async ({ profile_uuid, rule_set_uuid, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets/{rule_set_uuid}/rules',
          { pathParams: { profile_uuid, rule_set_uuid }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_enhanced_content_filtering_rule',
    {
      description: 'Create a rule within an enhanced content filtering profile rule set.',
      inputSchema: { profile_uuid: z.string(), rule_set_uuid: z.string(), body: jsonBody },
    },
    async ({ profile_uuid, rule_set_uuid, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets/{rule_set_uuid}/rules',
          { pathParams: { profile_uuid, rule_set_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_enhanced_content_filtering_rule',
    {
      description: 'Get a rule within an enhanced content filtering profile rule set.',
      inputSchema: { profile_uuid: z.string(), rule_set_uuid: z.string(), uuid: z.string() },
    },
    async ({ profile_uuid, rule_set_uuid, uuid }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets/{rule_set_uuid}/rules/{uuid}',
          { pathParams: { profile_uuid, rule_set_uuid, uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_enhanced_content_filtering_rule',
    {
      description: 'Update a rule within an enhanced content filtering profile rule set.',
      inputSchema: {
        profile_uuid: z.string(),
        rule_set_uuid: z.string(),
        uuid: z.string(),
        body: jsonBody,
      },
    },
    async ({ profile_uuid, rule_set_uuid, uuid, body }) => {
      try {
        const data = await client.request(
          'PUT',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets/{rule_set_uuid}/rules/{uuid}',
          { pathParams: { profile_uuid, rule_set_uuid, uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_enhanced_content_filtering_rule',
    {
      description: 'Delete a rule within an enhanced content filtering profile rule set.',
      inputSchema: { profile_uuid: z.string(), rule_set_uuid: z.string(), uuid: z.string() },
    },
    async ({ profile_uuid, rule_set_uuid, uuid }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/enhanced_content_filtering_profiles/{profile_uuid}/rule_sets/{rule_set_uuid}/rules/{uuid}',
          { pathParams: { profile_uuid, rule_set_uuid, uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
