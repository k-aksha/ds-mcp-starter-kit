import type { McpServer } from '@modelcontextprotocol/server';
import type { ZodRawShape } from 'zod';

import type { CreateServerOptions, ToolContext, ToolModule, ToolName } from './types.js';
import { standardTools } from './tools/standard-tools.js';

function adapterIsConfigured(ctx: ToolContext, adapterName: NonNullable<ToolModule['requires']>[number]): boolean {
  return Boolean(ctx.adapters[adapterName]);
}

function toolIsEnabled(toolName: ToolName, ctx: ToolContext): boolean {
  const enabled = ctx.config.tools?.enabled;
  const disabled = ctx.config.tools?.disabled ?? [];

  if (disabled.includes(toolName)) return false;
  if (enabled && enabled.length > 0) return enabled.includes(toolName);
  return true;
}

function registerOne(server: McpServer, tool: ToolModule, ctx: ToolContext): void {
  const config = {
    title: tool.title,
    description: tool.description,
    annotations: tool.annotations,
    ...(tool.inputSchema ? { inputSchema: tool.inputSchema as ZodRawShape } : {}),
  };

  if (tool.inputSchema) {
    server.registerTool(
      tool.name,
      config as never,
      async (args: Record<string, unknown>) => {
      try {
        const result = await tool.run(args as never, ctx);
        return {
          content: [{ type: 'text' as const, text: result.text }],
          isError: result.isError ?? false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `Tool "${tool.name}" failed: ${message}` }],
          isError: true,
        };
      }
    });
    return;
  }

  server.registerTool(tool.name, config as never, async () => {
      try {
        const result = await tool.run(undefined as never, ctx);
        return {
          content: [{ type: 'text' as const, text: result.text }],
          isError: result.isError ?? false,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: `Tool "${tool.name}" failed: ${message}` }],
          isError: true,
        };
      }
    },
  );
}

export function registerTools(server: McpServer, options: CreateServerOptions): void {
  const ctx: ToolContext = {
    config: options.config,
    adapters: options.adapters,
  };

  const allTools = [...standardTools, ...(options.extraTools ?? [])];

  for (const tool of allTools) {
    if (!toolIsEnabled(tool.name, ctx)) continue;

    const requirements = tool.requires ?? [];
    const hasRequirements = requirements.every((requirement) => adapterIsConfigured(ctx, requirement));
    if (!hasRequirements) continue;

    registerOne(server, tool, ctx);
  }
}

export function listAvailableTools(options: CreateServerOptions): ToolName[] {
  const ctx: ToolContext = {
    config: options.config,
    adapters: options.adapters,
  };

  return [...standardTools, ...(options.extraTools ?? [])]
    .filter((tool) => toolIsEnabled(tool.name, ctx))
    .filter((tool) => (tool.requires ?? []).every((requirement) => adapterIsConfigured(ctx, requirement)))
    .map((tool) => tool.name);
}
