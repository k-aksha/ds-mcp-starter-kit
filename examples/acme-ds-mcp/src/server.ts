import { createAdaptersFromSnapshot, createDesignSystemMcpServer } from '@ds-mcp/core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { acmeConfig } from './config.js';
import type { SnapshotCatalog } from '@ds-mcp/core';

const snapshotPath = fileURLToPath(new URL('../data/catalog.snapshot.json', import.meta.url));
const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8')) as SnapshotCatalog;

export function createAcmeServer() {
  return createDesignSystemMcpServer({
    config: acmeConfig,
    adapters: createAdaptersFromSnapshot(snapshot),
  });
}
