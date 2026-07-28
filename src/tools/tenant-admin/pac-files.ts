import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SdCloudClient } from '../../client.js';
import { toToolResult, toErrorResult } from '../../lib/format.js';

export function registerPacFileTools(server: McpServer, client: SdCloudClient) {
  server.registerTool(
    'sdcloud_get_pac_file',
    {
      description: 'Get a PAC file by name.',
      inputSchema: { name: z.string() },
    },
    async ({ name }) => {
      try {
        const data = await client.request('GET', '/api/v2/pac-file/{name}', {
          pathParams: { name },
        });
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );

  server.registerTool(
    'sdcloud_list_pac_files',
    {
      description: 'List all PAC files. This endpoint does not support pagination params.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await client.request('GET', '/api/v2/pac-files');
        return toToolResult(data);
      } catch (e) {
        return toErrorResult(e);
      }
    },
  );
}
