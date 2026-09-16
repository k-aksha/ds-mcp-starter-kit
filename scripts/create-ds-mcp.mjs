#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const templateDir = fileURLToPath(new URL('../templates/ds-mcp-starter', import.meta.url));
const targetDir = resolve(process.cwd(), process.argv[2] ?? 'my-ds-mcp');

const systemName = process.argv[3] ?? 'My Design System';
const slug = systemName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const packageName = `@${slug}/mcp`;
const binName = `${slug}-mcp`;

if (existsSync(targetDir)) {
  console.error(`Target directory already exists: ${targetDir}`);
  process.exit(1);
}

function copyTemplate() {
  cpSync(templateDir, targetDir, { recursive: true });
  cpSync(
    fileURLToPath(new URL('../examples/acme-ds-mcp/data/catalog.snapshot.json', import.meta.url)),
    join(targetDir, 'data/catalog.snapshot.json'),
  );
}

function render(filePath) {
  const content = readFileSync(filePath, 'utf8')
    .replaceAll('{{SYSTEM_NAME}}', systemName)
    .replaceAll('{{PACKAGE_NAME}}', packageName)
    .replaceAll('{{BIN_NAME}}', binName)
    .replaceAll('{{NPM_PACKAGE}}', `@${slug}/design-system`);
  writeFileSync(filePath, content);
}

copyTemplate();
mkdirSync(join(targetDir, 'src'), { recursive: true });

writeFileSync(
  join(targetDir, 'src/config.ts'),
  readFileSync(join(templateDir, 'src/config.ts.template'), 'utf8')
    .replaceAll('{{SYSTEM_NAME}}', systemName)
    .replaceAll('{{NPM_PACKAGE}}', `@${slug}/design-system`),
);

writeFileSync(
  join(targetDir, 'src/server.ts'),
  readFileSync(join(templateDir, 'src/server.ts.template'), 'utf8'),
);

writeFileSync(
  join(targetDir, 'src/index.ts'),
  readFileSync(join(templateDir, 'src/index.ts.template'), 'utf8').replaceAll('{{SLUG}}', slug),
);

render(join(targetDir, 'package.json'));

console.log(`Created design-system MCP scaffold at ${targetDir}`);
console.log('');
console.log('Next steps:');
console.log(`  cd ${targetDir}`);
console.log('  npm install');
console.log('  npm run build');
console.log('  npm start');
