import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

const setupBody = z
  .record(z.string(), z.unknown())
  .describe(
    'JSON body with an `l2_cluster_setup_config` object (primary_device_id, secondary_device_id, node0/node1 hostname and management settings, fabric/control links, redundancy_groups, reth_interfaces, zones). See CreateL2ClusterDeploymentRequest in spec/openapi.json.',
  );

/** Registers tools for /api/v1/l2_cluster_deployments, l2_cluster_model_config, and cluster interface status. */
export function registerL2ClusterTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_cluster_interface_status',
    {
      description: 'Get cluster interface status information for a device.',
      inputSchema: { device_id: z.string() },
    },
    async ({ device_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/device_operations/{device_id}/cluster_interface_status', {
          pathParams: { device_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_l2_cluster_model_config',
    {
      description: 'Get the L2 (chassis) cluster model configuration (supported models and port/link options).',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v1/l2_cluster_model_config');
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_create_l2_cluster_deployment',
    {
      description: 'Create an L2 cluster deployment (saved configuration; does not deploy until committed).',
      inputSchema: { body: setupBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/l2_cluster_deployments', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_validate_l2_cluster_deployment',
    {
      description: 'Validate an L2 cluster deployment configuration without creating or deploying it.',
      inputSchema: { body: setupBody },
    },
    async ({ body }) => {
      try {
        const data = await client.request('POST', '/api/v1/l2_cluster_deployments/validate', { body });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_l2_cluster_deployment',
    {
      description: 'Get an L2 cluster deployment by id.',
      inputSchema: { l2_cluster_deployment_id: z.string() },
    },
    async ({ l2_cluster_deployment_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/l2_cluster_deployments/{l2_cluster_deployment_id}', {
          pathParams: { l2_cluster_deployment_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_update_l2_cluster_deployment',
    {
      description: 'Update an L2 cluster deployment by id.',
      inputSchema: { l2_cluster_deployment_id: z.string(), body: setupBody },
    },
    async ({ l2_cluster_deployment_id, body }) => {
      try {
        const data = await client.request('PUT', '/api/v1/l2_cluster_deployments/{l2_cluster_deployment_id}', {
          pathParams: { l2_cluster_deployment_id },
          body,
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_delete_l2_cluster_deployment',
    {
      description: 'Delete an L2 cluster deployment by id.',
      inputSchema: { l2_cluster_deployment_id: z.string() },
    },
    async ({ l2_cluster_deployment_id }) => {
      try {
        const data = await client.request('DELETE', '/api/v1/l2_cluster_deployments/{l2_cluster_deployment_id}', {
          pathParams: { l2_cluster_deployment_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_commit_l2_cluster_deployment',
    {
      description:
        'Deploy (commit) an L2 cluster deployment to the devices. This changes live device configuration. Poll sdcloud_get_l2_cluster_deployment_status for progress.',
      inputSchema: { l2_cluster_deployment_id: z.string() },
    },
    async ({ l2_cluster_deployment_id }) => {
      try {
        const data = await client.request('POST', '/api/v1/l2_cluster_deployments/{l2_cluster_deployment_id}/deploy', {
          pathParams: { l2_cluster_deployment_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_get_l2_cluster_deployment_status',
    {
      description: 'Get the deployment status of an L2 cluster deployment.',
      inputSchema: { l2_cluster_deployment_id: z.string() },
    },
    async ({ l2_cluster_deployment_id }) => {
      try {
        const data = await client.request('GET', '/api/v1/l2_cluster_deployments/{l2_cluster_deployment_id}/status', {
          pathParams: { l2_cluster_deployment_id },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
