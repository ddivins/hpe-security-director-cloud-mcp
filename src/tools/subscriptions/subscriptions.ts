import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

/**
 * /api/v1/subscriptions* list endpoints support from/size/filters/sortby, matching the
 * standard v1 listParams pattern. Note: unlike the addresses.ts exemplar, the spec for
 * these two subscription endpoints does NOT define a `count` query param — omitted here.
 */
const listParams = {
  from: z.string().optional().describe('Starting index for pagination (zero-based). Default 0.'),
  size: z.string().optional().describe('Max results per page. 0 returns the API-imposed maximum.'),
  filters: z.string().optional().describe('Filter conditions to apply to the results.'),
  sortby: z.string().optional().describe('Sort field, e.g. sortby=(name(descending)).'),
};

export function registerSubscriptionTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_list_subscriptions',
    {
      description: 'List subscriptions with optional pagination, filtering, and sorting.',
      inputSchema: listParams,
    },
    async (args) => {
      try {
        const data = await client.request('GET', '/api/v1/subscriptions', { query: args });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_subscription_associations',
    {
      description:
        'List associations (e.g. sites/devices) for a subscription, with optional pagination, filtering, and sorting.',
      inputSchema: { subscription_uuid: z.string(), ...listParams },
    },
    async ({ subscription_uuid, ...query }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/subscriptions/{subscription_uuid}/associations',
          { pathParams: { subscription_uuid }, query },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_subscription_association',
    {
      description: 'Associate a subscription with a target resource (e.g. site or device).',
      inputSchema: { subscription_uuid: z.string(), body: jsonBody },
    },
    async ({ subscription_uuid, body }) => {
      try {
        const data = await client.request(
          'POST',
          '/api/v1/subscriptions/{subscription_uuid}/associations/create',
          { pathParams: { subscription_uuid }, body },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
