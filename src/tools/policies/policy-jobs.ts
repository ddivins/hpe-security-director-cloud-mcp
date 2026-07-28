import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const jsonBody = z
  .record(z.string(), z.unknown())
  .describe('JSON request body matching the target Security Director Cloud schema.');

const CROSS_POLICY_NOTE =
  'Operates across ALL policies (both firewall and NAT) referenced in the request body, unlike ' +
  'the single-policy sdcloud_{deploy,preview,cleanup,selective_deploy}_{firewall,nat}_policy tools, ' +
  'which act on one policy_id at a time.';

/**
 * Registers tools for the top-level, cross-policy-type async job endpoints under
 * /api/v1/policies/{deploy,preview,cleanup,selective_deploy}. These kick off a bulk job spanning
 * multiple policies (of either type) at once and are polled via a job ID, in contrast to the
 * single-policy action endpoints already covered by registerFirewallPolicyTools and
 * registerNatPolicyTools (e.g. /api/v1/policies/firewall/{policy_id}/deploy).
 */
export function registerPolicyJobTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_start_policy_deploy_job',
    {
      description:
        `Start a bulk deploy job across multiple policies/devices. ${CROSS_POLICY_NOTE} Body typically includes a list of policy_ids and/or device_ids to deploy.`,
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/deploy', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_deploy_job',
    {
      description: 'Get the status of a bulk policy deploy job by deploy_id.',
      inputSchema: { deploy_id: z.string() },
    },
    async ({ deploy_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/deploy/{deploy_id}', {
          pathParams: { deploy_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_deploy_job_device_status',
    {
      description: 'Get the per-device result of a bulk policy deploy job.',
      inputSchema: {
        deploy_id: z.string(),
        device_id: z.string(),
        format: z.string().optional().describe('Optional result format, e.g. text or json.'),
      },
    },
    async ({ deploy_id, device_id, format }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/deploy/{deploy_id}/devices/{device_id}',
          { pathParams: { deploy_id, device_id }, query: { format } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_start_policy_preview_job',
    {
      description:
        `Start a bulk preview job across multiple policies/devices, computing the configuration diff a deploy would produce without applying it. ${CROSS_POLICY_NOTE}`,
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/preview', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_preview_job',
    {
      description: 'Get the status of a bulk policy preview job by preview_id.',
      inputSchema: { preview_id: z.string() },
    },
    async ({ preview_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/preview/{preview_id}', {
          pathParams: { preview_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_preview_job_device_status',
    {
      description: 'Get the per-device result of a bulk policy preview job.',
      inputSchema: {
        preview_id: z.string(),
        device_id: z.string(),
        format: z.string().optional().describe('Optional result format, e.g. text or json.'),
      },
    },
    async ({ preview_id, device_id, format }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/preview/{preview_id}/devices/{device_id}',
          { pathParams: { preview_id, device_id }, query: { format } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_start_policy_cleanup_job',
    {
      description:
        `Start a bulk cleanup job across multiple policies, removing unused objects/rules. ${CROSS_POLICY_NOTE}`,
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/cleanup', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_cleanup_job',
    {
      description: 'Get the status of a bulk policy cleanup job by cleanup_id.',
      inputSchema: { cleanup_id: z.string() },
    },
    async ({ cleanup_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/policies/cleanup/{cleanup_id}', {
          pathParams: { cleanup_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_cleanup_job_device_status',
    {
      description: 'Get the per-device result of a bulk policy cleanup job.',
      inputSchema: {
        cleanup_id: z.string(),
        device_id: z.string(),
        format: z.string().optional().describe('Optional result format, e.g. text or json.'),
      },
    },
    async ({ cleanup_id, device_id, format }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/cleanup/{cleanup_id}/devices/{device_id}',
          { pathParams: { cleanup_id, device_id }, query: { format } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_start_policy_selective_deploy_job',
    {
      description:
        `Start a bulk selective-deploy job, deploying multiple policies to a selective subset of their assigned devices. ${CROSS_POLICY_NOTE}`,
      inputSchema: { body: jsonBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/policies/selective_deploy', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_selective_deploy_job',
    {
      description: 'Get the status of a bulk policy selective-deploy job by selective_deploy_id.',
      inputSchema: { selective_deploy_id: z.string() },
    },
    async ({ selective_deploy_id }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/selective_deploy/{selective_deploy_id}',
          { pathParams: { selective_deploy_id } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_policy_selective_deploy_job_device_status',
    {
      description: 'Get the per-device result of a bulk policy selective-deploy job.',
      inputSchema: {
        selective_deploy_id: z.string(),
        device_id: z.string(),
        format: z.string().optional().describe('Optional result format, e.g. text or json.'),
      },
    },
    async ({ selective_deploy_id, device_id, format }) => {
      try {
        const data = await client.request(
          'GET',
          '/api/v1/policies/selective_deploy/{selective_deploy_id}/devices/{device_id}',
          { pathParams: { selective_deploy_id, device_id }, query: { format } },
        );
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
