import type { ToolResult } from '../types.js';

export function textResult(text: string, isError = false): ToolResult {
  return { text, isError };
}

export function jsonResult(value: unknown, isError = false): ToolResult {
  return {
    text: JSON.stringify(value, null, 2),
    isError,
  };
}

export function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

export async function resolve<T>(value: Promise<T> | T): Promise<T> {
  return await value;
}

export function missingAdapterMessage(toolName: string, adapterName: string): ToolResult {
  return textResult(
    `The "${toolName}" tool is not configured. Provide a "${adapterName}" adapter in your MCP server setup.`,
    true,
  );
}

export function notFoundMessage(kind: string, idOrName: string): ToolResult {
  return textResult(`No ${kind} found for "${idOrName}".`, true);
}
