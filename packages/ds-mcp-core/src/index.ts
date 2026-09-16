import { McpServer } from '@modelcontextprotocol/server';

import { listAvailableTools, registerTools } from './register-tools.js';
import type { CreateServerOptions } from './types.js';

export function createDesignSystemMcpServer(options: CreateServerOptions): McpServer {
  const server = new McpServer(
    {
      name: options.config.name,
      version: options.config.version,
    },
    options.config.instructions
      ? {
          instructions: options.config.instructions,
        }
      : undefined,
  );

  registerTools(server, options);

  return server;
}

export { listAvailableTools, registerTools };
export * from './types.js';
export * from './adapters/snapshot.js';
export { standardTools } from './tools/standard-tools.js';
