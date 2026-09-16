#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';

import { createAcmeServer } from './server.js';

try {
  const server = createAcmeServer();
  await server.connect(new StdioServerTransport());
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[acme-ds-mcp] fatal: ${message}\n`);
  process.exit(1);
}
