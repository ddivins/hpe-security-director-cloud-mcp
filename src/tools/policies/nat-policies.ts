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

const natType = z
  .enum(['NAT_TYPE_STATIC', 'NAT_TYPE_SOURCE', 'NAT_TYPE_DESTINATION'])
  .describe('The NAT type for the rule.');

const trafficMatchType = z
  .enum(['NAT_RULE_MATCH_ZONE', 'NAT_RULE_MATCH_INTERFACE', 'NAT_RULE_MATCH_VIRTUAL_ROUTER'])
  .describe('The traffic match type for source/destination matching.');

/**
 * Registers tools for /api/v1/policies/nat and its nested rule_groups/rules/assignments/
 * arp_entries/proxy_ndp_entries/deploy/preview/cleanup/selective_deploy/state sub-resources.
 * Unlike firewall policies, NAT policies have no {scope} segment (global/zone) in any of their
 * URLs, NAT rule_groups have no PUT (create/replace-in-place is not supported, only
 * GET/POST/DELETE), and rule moves are split into two endpoints: a collection-level
 * rule_groups/move (for reordering rule groups) and a policy-level move_rules (for bulk-moving
 * rules), rather than firewall's per-rule rules/{rule_uuid}/move.
 */
export function registerNatPolicyTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_nat_policies',
    {
      description: 'List NAT policies with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_nat_policy',
    {
      description:
        'Create a new NAT policy. Body typically includes name, description, all_site_policy, order.',
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/nat', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_nat_policy',
    {
      description: 'Get a NAT policy by ID.',
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat/{id}', {
          pathParams: { id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_nat_policy',
    {
      description: 'Update a NAT policy by ID.',
      inputSchema: { id: z.string(), body: jsonBody },
    },
    async ({ id, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/policies/nat/{id}', {
          pathParams: { id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_nat_policy',
    {
      description: 'Delete a NAT policy by ID.',
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/policies/nat/{id}', {
          pathParams: { id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_nat_policy_hierarchy',
    {
      description: "List a NAT policy's rule hierarchy. Unlike firewall policies, NAT policies have no global/zone scope segment.",
      inputSchema: { policy_id: z.string(), ...listParams },
    },
    async ({ policy_id, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat/{policy_id}/hierarchy', {
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
    'sdcloud_bulk_move_nat_policy_rules',
    {
      description:
        'Bulk-move NAT policy rules to a target rule group/position. Body: rule_ids, target_rule_group_id, position.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/nat/{policy_id}/move_rules', {
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
    'sdcloud_list_nat_policy_rule_groups',
    {
      description: 'List rule groups within a NAT policy.',
      inputSchema: { policy_id: z.string(), ...listParams },
    },
    async ({ policy_id, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat/{policy_id}/rule_groups', {
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
    'sdcloud_create_nat_policy_rule_group',
    {
      description: 'Create a rule group within a NAT policy.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/nat/{policy_id}/rule_groups', {
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
    'sdcloud_move_nat_policy_rule_groups',
    {
      description:
        'Reorder/move rule groups within a NAT policy. Unlike firewall (which moves individual rules via rules/{rule_uuid}/move), NAT moves are performed at the rule_groups collection level.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/nat/{policy_id}/rule_groups/move',
          { pathParams: { policy_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_nat_policy_rule_group',
    {
      description: 'Get a single rule group within a NAT policy.',
      inputSchema: { policy_id: z.string(), group_id: z.string() },
    },
    async ({ policy_id, group_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/nat/{policy_id}/rule_groups/{group_id}',
          { pathParams: { policy_id, group_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_nat_policy_rule_group',
    {
      description:
        'Delete a rule group within a NAT policy. If ungroup_rules is true, member rules are kept and ungrouped instead of deleted. Note: NAT rule groups cannot be updated in place (no PUT); delete and recreate instead.',
      inputSchema: {
        policy_id: z.string(),
        group_id: z.string(),
        ungroup_rules: z.boolean().optional(),
      },
    },
    async ({ policy_id, group_id, ungroup_rules }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/policies/nat/{policy_id}/rule_groups/{group_id}',
          { pathParams: { policy_id, group_id }, query: { ungroup_rules } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_nat_policy_rules_in_group',
    {
      description: 'List rules within a NAT policy rule group.',
      inputSchema: { policy_id: z.string(), group_id: z.string(), ...listParams },
    },
    async ({ policy_id, group_id, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/nat/{policy_id}/rule_groups/{group_id}/rules',
          { pathParams: { policy_id, group_id }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_nat_policy_rule_in_group',
    {
      description:
        'Create a rule inside a NAT policy rule group. Body typically includes name, description, nat_type, sources, destinations, translated addresses/ports.',
      inputSchema: { policy_id: z.string(), group_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, group_id, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/nat/{policy_id}/rule_groups/{group_id}/rules',
          { pathParams: { policy_id, group_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_nat_policy_rule_in_group',
    {
      description: 'Get a rule inside a NAT policy rule group.',
      inputSchema: { policy_id: z.string(), group_id: z.string(), rule_id: z.string() },
    },
    async ({ policy_id, group_id, rule_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/nat/{policy_id}/rule_groups/{group_id}/rules/{rule_id}',
          { pathParams: { policy_id, group_id, rule_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_nat_policy_rule_in_group',
    {
      description: 'Update a rule inside a NAT policy rule group.',
      inputSchema: {
        policy_id: z.string(),
        group_id: z.string(),
        rule_id: z.string(),
        body: jsonBody,
      },
    },
    async ({ policy_id, group_id, rule_id, body }) => {
      try {
        const data = await client.request(
          'PUT',
          '/api/v1/policies/nat/{policy_id}/rule_groups/{group_id}/rules/{rule_id}',
          { pathParams: { policy_id, group_id, rule_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_nat_policy_rule_in_group',
    {
      description: 'Delete a rule inside a NAT policy rule group.',
      inputSchema: { policy_id: z.string(), group_id: z.string(), rule_id: z.string() },
    },
    async ({ policy_id, group_id, rule_id }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/policies/nat/{policy_id}/rule_groups/{group_id}/rules/{rule_id}',
          { pathParams: { policy_id, group_id, rule_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_nat_policy_rules',
    {
      description: 'List ungrouped rules directly under a NAT policy.',
      inputSchema: { policy_id: z.string(), ...listParams },
    },
    async ({ policy_id, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat/{policy_id}/rules', {
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
    'sdcloud_create_nat_policy_rule',
    {
      description:
        'Create a rule directly under a NAT policy (not inside a rule group). Body typically includes name, description, nat_type, sources, destinations, translated addresses/ports.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/nat/{policy_id}/rules', {
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
    'sdcloud_get_nat_policy_rule',
    {
      description: 'Get an ungrouped NAT policy rule.',
      inputSchema: { policy_id: z.string(), rule_id: z.string() },
    },
    async ({ policy_id, rule_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat/{policy_id}/rules/{rule_id}', {
          pathParams: { policy_id, rule_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_nat_policy_rule',
    {
      description: 'Update an ungrouped NAT policy rule.',
      inputSchema: { policy_id: z.string(), rule_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, rule_id, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/policies/nat/{policy_id}/rules/{rule_id}', {
          pathParams: { policy_id, rule_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_nat_policy_rule',
    {
      description: 'Delete an ungrouped NAT policy rule.',
      inputSchema: { policy_id: z.string(), rule_id: z.string() },
    },
    async ({ policy_id, rule_id }) => {
      try {
        const data = await client.request(
          'DELETE',
          '/api/v1/policies/nat/{policy_id}/rules/{rule_id}',
          { pathParams: { policy_id, rule_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_nat_policy_arp_entries',
    {
      description:
        'List ARP entries for a NAT policy (read-only). Used to inspect proxy-ARP address resolution for static/source/destination NAT translations.',
      inputSchema: {
        policy_id: z.string(),
        nat_type: natType,
        traffic_match_type: trafficMatchType,
        address_ids: z.array(z.string()).describe('Translation object IDs such as pool IDs or address IDs.'),
        rule_id: z.string().optional(),
        traffic_match_values: z.array(z.string()).optional(),
        zone_sets: z.array(z.string()).optional().describe('Required when traffic_match_type is ZONE.'),
      },
    },
    async ({ policy_id, ...query }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat/{policy_id}/arp_entries', {
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
    'sdcloud_list_nat_policy_proxy_ndp_entries',
    {
      description:
        'List proxy NDP (Neighbor Discovery Protocol) entries for a NAT policy (read-only). IPv6 analogue of ARP entries.',
      inputSchema: {
        policy_id: z.string(),
        nat_type: natType,
        traffic_match_type: trafficMatchType,
        address_ids: z.array(z.string()).describe('Translation object IDs such as pool IDs or address IDs.'),
        rule_id: z.string().optional(),
        traffic_match_values: z.array(z.string()).optional(),
        zone_sets: z.array(z.string()).optional().describe('Required when traffic_match_type is ZONE.'),
      },
    },
    async ({ policy_id, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/nat/{policy_id}/proxy_ndp_entries',
          { pathParams: { policy_id }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_nat_policy_assignments',
    {
      description: 'List device/site assignments for a NAT policy.',
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
        const data = await client.request('GET', '/api/v1/policies/nat/{policy_id}/assignments', {
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
    'sdcloud_batch_nat_policy_assignments',
    {
      description: 'Batch-assign or unassign devices/sites for a NAT policy.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/nat/{policy_id}/assignments/batch',
          { pathParams: { policy_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_cleanup_nat_policy',
    {
      description:
        'Trigger a cleanup job for unused objects/rules referencing a NAT policy. Body requires cleanup_mode (e.g. STRICT).',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/nat/{policy_id}/cleanup', {
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
    'sdcloud_deploy_nat_policy',
    {
      description: 'Deploy a single NAT policy to its assigned devices.',
      inputSchema: { policy_id: z.string() },
    },
    async ({ policy_id }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/nat/{policy_id}/deploy', {
          pathParams: { policy_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_preview_nat_policy',
    {
      description:
        'Preview the configuration diff a NAT policy deployment would produce. Body requires deploy_targets and/or undeploy_targets (each a list of {target_id, target_type}).',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/nat/{policy_id}/preview', {
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
    'sdcloud_selective_deploy_nat_policy',
    {
      description: 'Deploy a NAT policy to a selective subset of its assigned devices.',
      inputSchema: { policy_id: z.string(), body: jsonBody },
    },
    async ({ policy_id, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/policies/nat/{policy_id}/selective_deploy',
          { pathParams: { policy_id }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_nat_policy_state',
    {
      description: 'Get the deployment state of a NAT policy (e.g. up to date, pending, out of sync).',
      inputSchema: {
        policy_id: z.string(),
        include_assigned_devices: z.boolean().optional(),
      },
    },
    async ({ policy_id, include_assigned_devices }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/nat/{policy_id}/state', {
          pathParams: { policy_id },
          query: { include_assigned_devices },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
