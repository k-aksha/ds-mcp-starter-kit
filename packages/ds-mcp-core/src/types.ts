import type { ZodRawShape } from 'zod';

export type ToolName =
  | 'init'
  | 'list_components'
  | 'get_component'
  | 'get_component_examples'
  | 'get_component_usage_guidelines'
  | 'get_component_accessibility_guidelines'
  | 'list_patterns'
  | 'get_pattern'
  | 'find_tokens'
  | 'get_token_group_bundle'
  | 'get_design_token_specs'
  | 'get_token_usage_patterns'
  | 'list_icons'
  | 'get_icon'
  | 'get_color_usage'
  | 'get_typography_usage'
  | 'coding_guidelines'
  | 'review_alt_text'
  | 'lint_css';

export interface DesignSystemConfig {
  name: string;
  version: string;
  packageName?: string;
  instructions?: string;
  tools?: {
    enabled?: ToolName[];
    disabled?: ToolName[];
  };
}

export interface ComponentMeta {
  id: string;
  name: string;
  importPath?: string;
  slug?: string;
  description?: string;
}

export interface ComponentDetail extends ComponentMeta {
  props?: Record<string, unknown>;
  api?: string;
  subcomponents?: string[];
}

export interface PatternMeta {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface PatternDetail extends PatternMeta {
  guidance?: string;
}

export interface TokenMeta {
  name: string;
  value?: string;
  group?: string;
  description?: string;
  cssVariable?: string;
}

export interface TokenGroup {
  id: string;
  name: string;
  tokens: TokenMeta[];
}

export interface IconMeta {
  id?: string;
  name: string;
  keywords?: string[];
  sizes?: string[];
}

export interface IconDetail extends IconMeta {
  importPath?: string;
  usage?: string;
}

export interface FoundationGuide {
  topic: string;
  content: string;
}

export interface LintCssResult {
  ok: boolean;
  findings: string[];
}

export interface ComponentCatalogAdapter {
  listComponents(): Promise<ComponentMeta[]> | ComponentMeta[];
  getComponent(idOrName: string): Promise<ComponentDetail | null> | ComponentDetail | null;
  getExamples?(idOrName: string): Promise<string | null> | string | null;
  getUsageGuidelines?(idOrName: string): Promise<string | null> | string | null;
  getAccessibilityGuidelines?(idOrName: string): Promise<string | null> | string | null;
}

export interface PatternCatalogAdapter {
  listPatterns(): Promise<PatternMeta[]> | PatternMeta[];
  getPattern(idOrName: string): Promise<PatternDetail | null> | PatternDetail | null;
}

export interface TokenCatalogAdapter {
  listGroups?(): Promise<string[]> | string[];
  findTokens(query: string, group?: string): Promise<TokenMeta[]> | TokenMeta[];
  getGroupBundle(group: string): Promise<TokenGroup | null> | TokenGroup | null;
  getSpecs?(): Promise<string> | string;
  getUsagePatterns?(): Promise<string> | string;
}

export interface IconCatalogAdapter {
  listIcons(): Promise<IconMeta[]> | IconMeta[];
  getIcon(name: string): Promise<IconDetail | null> | IconDetail | null;
}

export interface DocsAdapter {
  getGettingStarted?(): Promise<string> | string;
  getCodingGuidelines?(): Promise<string> | string;
  getColorUsage?(): Promise<string> | string;
  getTypographyUsage?(): Promise<string> | string;
}

export interface ReviewAdapter {
  reviewAltText(altText: string, context?: string): Promise<string> | string;
  lintCss?(css: string): Promise<LintCssResult> | LintCssResult;
}

export interface DesignSystemAdapters {
  components?: ComponentCatalogAdapter;
  patterns?: PatternCatalogAdapter;
  tokens?: TokenCatalogAdapter;
  icons?: IconCatalogAdapter;
  docs?: DocsAdapter;
  review?: ReviewAdapter;
}

export interface ToolContext {
  config: DesignSystemConfig;
  adapters: DesignSystemAdapters;
}

export interface ToolResult {
  text: string;
  isError?: boolean;
}

export interface ToolModule<Input = unknown> {
  name: ToolName;
  title: string;
  description: string;
  inputSchema?: ZodRawShape;
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
  };
  requires?: Array<keyof DesignSystemAdapters>;
  run(input: Input, ctx: ToolContext): Promise<ToolResult> | ToolResult;
}

export interface CreateServerOptions {
  config: DesignSystemConfig;
  adapters: DesignSystemAdapters;
  extraTools?: ToolModule[];
}

export interface SnapshotCatalog {
  components?: ComponentMeta[];
  patterns?: PatternMeta[];
  tokens?: TokenMeta[];
  icons?: IconMeta[];
  docs?: {
    gettingStarted?: string;
    codingGuidelines?: string;
    colorUsage?: string;
    typographyUsage?: string;
  };
}
