import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

const scope = z.enum(['global', 'zone']).describe("Rule scope: 'global' or 'zone'.");

const listParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filters: z.string().optional().describe('Filter conditions to apply to the results.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
  count: z.boolean().optional().describe('If true, return only the total count, no item details.'),
};

/**
 * Registers tools for /api/v1/policies/firewall and its nested rule_groups/rules/assignments/
 * deploy/preview/cleanup/selective_deploy/state sub-resources. Note several of these (cleanup,
 * deploy, preview, selective_deploy, assignments, state) are tagged differently in the spec
 * ('Policy Cleanup', 'Policy Deploy', etc.) but are grouped here by URL, since they all operate
 * on a single firewall policy identified by policy_id/policy_uuid.
 */
export function registerFirewallPolicyTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_firewall_policies',
    {
      description: 'List firewall policies with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/firewall', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_firewall_policy',
    {
      description:
        'Create a new firewall policy. Body typically includes name, description, all_site_policy, order.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/firewall', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_firewall_policy',
    {
      description: 'Get a firewall policy by UUID.',
      inputSchema: { policy_uuid: z.string() },
    },
    async ({ policy_uuid }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/firewall/{policy_uuid}', {
          pathParams: { policy_uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_firewall_policy',
    {
      description: 'Update a firewall policy by UUID.',
      inputSchema: { policy_uuid: z.string(), body: jsonBody },
    },
    async ({ policy_uuid, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/policies/firewall/{policy_uuid}', {
          pathParams: { policy_uuid },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_firewall_policy',
    {
      description: 'Delete a firewall policy by UUID.',
      inputSchema: { policy_uuid: z.string() },
    },
    async ({ policy_uuid }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/policies/firewall/{policy_uuid}', {
          pathParams: { policy_uuid },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_firewall_policy_hierarchy',
    {
      description: "List a firewall policy's rule hierarchy for a given scope (global or zone).",
      inputSchema: { policy_uuid: z.string(), scope, ...listParams },
    },
    async ({ policy_uuid, scope: scopeVal, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/heirarchy',
          { pathParams: { policy_uuid, scope: scopeVal }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_bulk_move_firewall_policy_rules',
    {
      description:
        'Bulk-move firewall policy rules to a target rule group/scope/position. Body: rule_uuids, target_rule_group_id, position, target_scope.',
      inputSchema: { policy_uuid: z.string(), scope, body: jsonBody },
    },
    async ({ policy_uuid, scope: scopeVal, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/move_rules',
          { pathParams: { policy_uuid, scope: scopeVal }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_firewall_policy_rule_groups',
    {
      description: 'List rule groups within a firewall policy scope.',
      inputSchema: { policy_uuid: z.string(), scope, ...listParams },
    },
    async ({ policy_uuid, scope: scopeVal, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups',
          { pathParams: { policy_uuid, scope: scopeVal }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_firewall_policy_rule_group',
    {
      description: 'Create a rule group within a firewall policy scope.',
      inputSchema: { policy_uuid: z.string(), scope, body: jsonBody },
    },
    async ({ policy_uuid, scope: scopeVal, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups',
          { pathParams: { policy_uuid, scope: scopeVal }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_firewall_policy_rule_group',
    {
      description: 'Get a single rule group within a firewall policy scope.',
      inputSchema: { policy_uuid: z.string(), scope, group_uuid: z.string() },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_firewall_policy_rule_group',
    {
      description: 'Update a rule group within a firewall policy scope.',
      inputSchema: { policy_uuid: z.string(), scope, group_uuid: z.string(), body: jsonBody },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, body }) => {
      try {
        const data = await client.request(
          'PUT',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_firewall_policy_rule_group',
    {
      description:
        'Delete a rule group within a firewall policy scope. If ungroup_rules is true, member rules are kept and ungrouped instead of deleted.',
      inputSchema: {
        policy_uuid: z.string(),
        scope,
        group_uuid: z.string(),
        ungroup_rules: z.boolean().optional(),
      },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, ungroup_rules }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid }, query: { ungroup_rules } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_firewall_policy_rules_in_group',
    {
      description: 'List rules within a firewall policy rule group.',
      inputSchema: { policy_uuid: z.string(), scope, group_uuid: z.string(), ...listParams },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}/rules',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_firewall_policy_rule_in_group',
    {
      description:
        'Create a rule inside a firewall policy rule group. Body typically includes name, description, action, sources, destinations, applications.',
      inputSchema: { policy_uuid: z.string(), scope, group_uuid: z.string(), body: jsonBody },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}/rules',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_firewall_policy_rule_in_group',
    {
      description: 'Get a rule inside a firewall policy rule group.',
      inputSchema: {
        policy_uuid: z.string(),
        scope,
        group_uuid: z.string(),
        rule_uuid: z.string(),
      },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, rule_uuid }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}/rules/{rule_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid, rule_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_firewall_policy_rule_in_group',
    {
      description: 'Update a rule inside a firewall policy rule group.',
      inputSchema: {
        policy_uuid: z.string(),
        scope,
        group_uuid: z.string(),
        rule_uuid: z.string(),
        body: jsonBody,
      },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, rule_uuid, body }) => {
      try {
        const data = await client.request(
          'PUT',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}/rules/{rule_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid, rule_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_firewall_policy_rule_in_group',
    {
      description: 'Delete a rule inside a firewall policy rule group.',
      inputSchema: {
        policy_uuid: z.string(),
        scope,
        group_uuid: z.string(),
        rule_uuid: z.string(),
      },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, rule_uuid }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}/rules/{rule_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid, rule_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_move_firewall_policy_rule_in_group',
    {
      description: 'Move (reorder) a single rule within its firewall policy rule group.',
      inputSchema: {
        policy_uuid: z.string(),
        scope,
        group_uuid: z.string(),
        rule_uuid: z.string(),
        position: z.number().describe('Target 1-based position within the group.'),
      },
    },
    async ({ policy_uuid, scope: scopeVal, group_uuid, rule_uuid, position }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rule_groups/{group_uuid}/rules/{rule_uuid}/move',
          { pathParams: { policy_uuid, scope: scopeVal, group_uuid, rule_uuid }, body: { position } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_firewall_policy_rules',
    {
      description: 'List ungrouped rules directly under a firewall policy scope.',
      inputSchema: { policy_uuid: z.string(), scope, ...listParams },
    },
    async ({ policy_uuid, scope: scopeVal, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rules',
          { pathParams: { policy_uuid, scope: scopeVal }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_firewall_policy_rule',
    {
      description:
        'Create a rule directly under a firewall policy scope (not inside a rule group). Body typically includes name, description, action, sources, destinations, applications.',
      inputSchema: { policy_uuid: z.string(), scope, body: jsonBody },
    },
    async ({ policy_uuid, scope: scopeVal, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rules',
          { pathParams: { policy_uuid, scope: scopeVal }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_firewall_policy_rule',
    {
      description: 'Get an ungrouped firewall policy rule.',
      inputSchema: { policy_uuid: z.string(), scope, rule_uuid: z.string() },
    },
    async ({ policy_uuid, scope: scopeVal, rule_uuid }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rules/{rule_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, rule_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_firewall_policy_rule',
    {
      description: 'Update an ungrouped firewall policy rule.',
      inputSchema: { policy_uuid: z.string(), scope, rule_uuid: z.string(), body: jsonBody },
    },
    async ({ policy_uuid, scope: scopeVal, rule_uuid, body }) => {
      try {
        const data = await client.request(
          'PUT',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rules/{rule_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, rule_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_firewall_policy_rule',
    {
      description: 'Delete an ungrouped firewall policy rule.',
      inputSchema: { policy_uuid: z.string(), scope, rule_uuid: z.string() },
    },
    async ({ policy_uuid, scope: scopeVal, rule_uuid }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/policies/firewall/{policy_uuid}/{scope}/rules/{rule_uuid}',
          { pathParams: { policy_uuid, scope: scopeVal, rule_uuid } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_firewall_policy_assignments',
    {
      description: 'List device/site assignments for a firewall policy.',
      inputSchema: {
        policy_id: z.string(),
        from: z.string().optional(),
        size: z.string().optional(),
        sortby: z.string().optional(),
        fields: z.array(z.string()).optional(),
        filters: z.string().optional(),
      },
    },
    async ({ policy_id, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/firewall/{policy_id}/assignments', {
          pathParams: { policy_id },
          query,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_batch_firewall_policy_assignments',
    {
      description: 'Batch-assign or unassign devices/sites for a firewall policy.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/firewall/{policy_id}/assignments/batch',
          { pathParams: { policy_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_cleanup_firewall_policy',
    {
      description:
        'Trigger a cleanup job for unused objects/rules referencing a firewall policy. Body requires cleanup_mode (e.g. STRICT).',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/firewall/{policy_id}/cleanup', {
          pathParams: { policy_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_deploy_firewall_policy',
    {
      description: 'Deploy a single firewall policy to its assigned devices.',
      inputSchema: { policy_id: z.string() },
    },
    async ({ policy_id }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/firewall/{policy_id}/deploy', {
          pathParams: { policy_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_preview_firewall_policy',
    {
      description:
        'Preview the configuration diff a firewall policy deployment would produce. Body requires deploy_targets and/or undeploy_targets (each a list of {target_id, target_type}).',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/firewall/{policy_id}/preview', {
          pathParams: { policy_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_selective_deploy_firewall_policy',
    {
      description: 'Deploy a firewall policy to a selective subset of its assigned devices.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/firewall/{policy_id}/selective_deploy',
          { pathParams: { policy_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_firewall_policy_state',
    {
      description: 'Get the deployment state of a firewall policy (e.g. up to date, pending, out of sync).',
      inputSchema: {
        policy_uuid: z.string(),
        include_assigned_devices: z.boolean().optional(),
      },
    },
    async ({ policy_uuid, include_assigned_devices }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/firewall/{policy_uuid}/state', {
          pathParams: { policy_uuid },
          query: { include_assigned_devices },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
