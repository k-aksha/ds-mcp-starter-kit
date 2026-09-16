import { z } from 'zod';

import type { ToolContext, ToolModule } from '../types.js';
import { bulletList, jsonResult, missingAdapterMessage, notFoundMessage, resolve, textResult } from '../utils/response.js';

const componentNameSchema = z.object({
  name: z.string().describe('Component id or display name'),
});

export const initTool: ToolModule = {
  name: 'init',
  title: 'Initialize project',
  description: 'Setup or create a project that uses the design system',
  annotations: { readOnlyHint: true },
  requires: ['docs'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.docs?.getGettingStarted) {
      return missingAdapterMessage('init', 'docs.getGettingStarted');
    }
    const gettingStarted = await resolve(ctx.adapters.docs.getGettingStarted());
    const packageName = ctx.config.packageName ?? 'your-design-system-package';
    return textResult(
      [
        `Getting started with ${ctx.config.name}`,
        '',
        'Project checklist:',
        `- Use a React + TypeScript toolchain (Vite, Next.js, etc.)`,
        `- Install ${packageName}`,
        `- Add the design system theme/provider at the app root`,
        `- Prefer components, tokens, icons, and patterns from ${ctx.config.name}`,
        '',
        gettingStarted,
      ].join('\n'),
    );
  },
};

export const listComponentsTool: ToolModule = {
  name: 'list_components',
  title: 'List components',
  description: 'List components available from the design system',
  annotations: { readOnlyHint: true },
  requires: ['components'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.components) return missingAdapterMessage('list_components', 'components');
    const components = await resolve(ctx.adapters.components.listComponents());
    return textResult(
      [
        `Components available in ${ctx.config.name}:`,
        '',
        bulletList(components.map((component) => component.name)),
        '',
        'Use get_component for API details.',
      ].join('\n'),
    );
  },
};

export const getComponentTool: ToolModule<{ name: string }> = {
  name: 'get_component',
  title: 'Get component',
  description: 'Get API information for a design system component',
  inputSchema: componentNameSchema.shape,
  annotations: { readOnlyHint: true },
  requires: ['components'],
  run: async (input, ctx) => {
    if (!ctx.adapters.components) return missingAdapterMessage('get_component', 'components');
    const component = await resolve(ctx.adapters.components.getComponent(input.name));
    if (!component) return notFoundMessage('component', input.name);
    return jsonResult(component);
  },
};

export const getComponentExamplesTool: ToolModule<{ name: string }> = {
  name: 'get_component_examples',
  title: 'Get component examples',
  description: 'Get examples for how to use a design system component',
  inputSchema: componentNameSchema.shape,
  annotations: { readOnlyHint: true },
  requires: ['components'],
  run: async (input, ctx) => {
    if (!ctx.adapters.components?.getExamples) {
      return missingAdapterMessage('get_component_examples', 'components.getExamples');
    }
    const examples = await resolve(ctx.adapters.components.getExamples(input.name));
    if (!examples) return notFoundMessage('component examples', input.name);
    return textResult(examples);
  },
};

export const getComponentUsageTool: ToolModule<{ name: string }> = {
  name: 'get_component_usage_guidelines',
  title: 'Get component usage guidelines',
  description: 'Get usage guidance for a design system component',
  inputSchema: componentNameSchema.shape,
  annotations: { readOnlyHint: true },
  requires: ['components'],
  run: async (input, ctx) => {
    if (!ctx.adapters.components?.getUsageGuidelines) {
      return missingAdapterMessage('get_component_usage_guidelines', 'components.getUsageGuidelines');
    }
    const guidance = await resolve(ctx.adapters.components.getUsageGuidelines(input.name));
    if (!guidance) return notFoundMessage('component usage guidelines', input.name);
    return textResult(guidance);
  },
};

export const getComponentAccessibilityTool: ToolModule<{ name: string }> = {
  name: 'get_component_accessibility_guidelines',
  title: 'Get component accessibility guidelines',
  description: 'Get accessibility guidance for a design system component',
  inputSchema: componentNameSchema.shape,
  annotations: { readOnlyHint: true },
  requires: ['components'],
  run: async (input, ctx) => {
    if (!ctx.adapters.components?.getAccessibilityGuidelines) {
      return missingAdapterMessage(
        'get_component_accessibility_guidelines',
        'components.getAccessibilityGuidelines',
      );
    }
    const guidance = await resolve(ctx.adapters.components.getAccessibilityGuidelines(input.name));
    if (!guidance) return notFoundMessage('component accessibility guidelines', input.name);
    return textResult(guidance);
  },
};

export const listPatternsTool: ToolModule = {
  name: 'list_patterns',
  title: 'List patterns',
  description: 'List available design system patterns',
  annotations: { readOnlyHint: true },
  requires: ['patterns'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.patterns) return missingAdapterMessage('list_patterns', 'patterns');
    const patterns = await resolve(ctx.adapters.patterns.listPatterns());
    return textResult(
      ['Available patterns:', '', bulletList(patterns.map((pattern) => pattern.name))].join('\n'),
    );
  },
};

export const getPatternTool: ToolModule<{ name: string }> = {
  name: 'get_pattern',
  title: 'Get pattern',
  description: 'Get guidance for a design system pattern',
  inputSchema: componentNameSchema.shape,
  annotations: { readOnlyHint: true },
  requires: ['patterns'],
  run: async (input, ctx) => {
    if (!ctx.adapters.patterns) return missingAdapterMessage('get_pattern', 'patterns');
    const pattern = await resolve(ctx.adapters.patterns.getPattern(input.name));
    if (!pattern) return notFoundMessage('pattern', input.name);
    return jsonResult(pattern);
  },
};

export const findTokensTool: ToolModule<{ query: string; group?: string }> = {
  name: 'find_tokens',
  title: 'Find tokens',
  description: 'Find design tokens by intent, name, or value',
  inputSchema: {
    query: z.string().describe('Search query'),
    group: z.string().optional().describe('Optional token group'),
  },
  annotations: { readOnlyHint: true },
  requires: ['tokens'],
  run: async (input, ctx) => {
    if (!ctx.adapters.tokens) return missingAdapterMessage('find_tokens', 'tokens');
    const tokens = await resolve(ctx.adapters.tokens.findTokens(input.query, input.group));
    if (tokens.length === 0) return textResult(`No tokens matched "${input.query}".`, true);
    return jsonResult(tokens);
  },
};

export const getTokenGroupBundleTool: ToolModule<{ group: string }> = {
  name: 'get_token_group_bundle',
  title: 'Get token group bundle',
  description: 'Get bundled token data for a token group',
  inputSchema: {
    group: z.string().describe('Token group id'),
  },
  annotations: { readOnlyHint: true },
  requires: ['tokens'],
  run: async (input, ctx) => {
    if (!ctx.adapters.tokens) return missingAdapterMessage('get_token_group_bundle', 'tokens');
    const bundle = await resolve(ctx.adapters.tokens.getGroupBundle(input.group));
    if (!bundle) return notFoundMessage('token group', input.group);
    return jsonResult(bundle);
  },
};

export const getDesignTokenSpecsTool: ToolModule = {
  name: 'get_design_token_specs',
  title: 'Get design token specs',
  description: 'Get design token specifications',
  annotations: { readOnlyHint: true },
  requires: ['tokens'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.tokens?.getSpecs) {
      return missingAdapterMessage('get_design_token_specs', 'tokens.getSpecs');
    }
    return textResult(await resolve(ctx.adapters.tokens.getSpecs()));
  },
};

export const getTokenUsagePatternsTool: ToolModule = {
  name: 'get_token_usage_patterns',
  title: 'Get token usage patterns',
  description: 'Get guidance for using design tokens',
  annotations: { readOnlyHint: true },
  requires: ['tokens'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.tokens?.getUsagePatterns) {
      return missingAdapterMessage('get_token_usage_patterns', 'tokens.getUsagePatterns');
    }
    return textResult(await resolve(ctx.adapters.tokens.getUsagePatterns()));
  },
};

export const listIconsTool: ToolModule = {
  name: 'list_icons',
  title: 'List icons',
  description: 'List icons available from the design system',
  annotations: { readOnlyHint: true },
  requires: ['icons'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.icons) return missingAdapterMessage('list_icons', 'icons');
    const icons = await resolve(ctx.adapters.icons.listIcons());
    return textResult(['Available icons:', '', bulletList(icons.map((icon) => icon.name))].join('\n'));
  },
};

export const getIconTool: ToolModule<{ name: string }> = {
  name: 'get_icon',
  title: 'Get icon',
  description: 'Get a specific icon by name',
  inputSchema: componentNameSchema.shape,
  annotations: { readOnlyHint: true },
  requires: ['icons'],
  run: async (input, ctx) => {
    if (!ctx.adapters.icons) return missingAdapterMessage('get_icon', 'icons');
    const icon = await resolve(ctx.adapters.icons.getIcon(input.name));
    if (!icon) return notFoundMessage('icon', input.name);
    return jsonResult(icon);
  },
};

export const getColorUsageTool: ToolModule = {
  name: 'get_color_usage',
  title: 'Get color usage',
  description: 'Get guidance for applying color in the UI',
  annotations: { readOnlyHint: true },
  requires: ['docs'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.docs?.getColorUsage) {
      return missingAdapterMessage('get_color_usage', 'docs.getColorUsage');
    }
    return textResult(await resolve(ctx.adapters.docs.getColorUsage()));
  },
};

export const getTypographyUsageTool: ToolModule = {
  name: 'get_typography_usage',
  title: 'Get typography usage',
  description: 'Get guidance for applying typography in the UI',
  annotations: { readOnlyHint: true },
  requires: ['docs'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.docs?.getTypographyUsage) {
      return missingAdapterMessage('get_typography_usage', 'docs.getTypographyUsage');
    }
    return textResult(await resolve(ctx.adapters.docs.getTypographyUsage()));
  },
};

export const codingGuidelinesTool: ToolModule = {
  name: 'coding_guidelines',
  title: 'Coding guidelines',
  description: 'Get guidance for writing code that uses the design system',
  annotations: { readOnlyHint: true },
  requires: ['docs'],
  run: async (_input, ctx) => {
    if (!ctx.adapters.docs?.getCodingGuidelines) {
      return missingAdapterMessage('coding_guidelines', 'docs.getCodingGuidelines');
    }
    return textResult(await resolve(ctx.adapters.docs.getCodingGuidelines()));
  },
};

export const reviewAltTextTool: ToolModule<{ altText: string; context?: string }> = {
  name: 'review_alt_text',
  title: 'Review alt text',
  description: 'Evaluate image alt text against accessibility best practices',
  inputSchema: {
    altText: z.string().describe('Alt text to review'),
    context: z.string().optional().describe('Optional UI context'),
  },
  annotations: { readOnlyHint: true },
  requires: ['review'],
  run: async (input, ctx) => {
    if (!ctx.adapters.review?.reviewAltText) {
      return missingAdapterMessage('review_alt_text', 'review.reviewAltText');
    }
    return textResult(await resolve(ctx.adapters.review.reviewAltText(input.altText, input.context)));
  },
};

export const lintCssTool: ToolModule<{ css: string }> = {
  name: 'lint_css',
  title: 'Lint CSS',
  description: 'Check CSS for design token usage',
  inputSchema: {
    css: z.string().describe('CSS source to lint'),
  },
  annotations: { readOnlyHint: true },
  requires: ['review'],
  run: async (input, ctx) => {
    if (!ctx.adapters.review?.lintCss) {
      return missingAdapterMessage('lint_css', 'review.lintCss');
    }
    const result = await resolve(ctx.adapters.review.lintCss(input.css));
    return jsonResult(result, !result.ok);
  },
};

export const standardTools: ToolModule[] = [
  initTool,
  listComponentsTool,
  getComponentTool,
  getComponentExamplesTool,
  getComponentUsageTool,
  getComponentAccessibilityTool,
  listPatternsTool,
  getPatternTool,
  findTokensTool,
  getTokenGroupBundleTool,
  getDesignTokenSpecsTool,
  getTokenUsagePatternsTool,
  listIconsTool,
  getIconTool,
  getColorUsageTool,
  getTypographyUsageTool,
  codingGuidelinesTool,
  reviewAltTextTool,
  lintCssTool,
];
