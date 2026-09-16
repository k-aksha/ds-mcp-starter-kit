import type { DesignSystemConfig } from '@ds-mcp/core';

export const acmeConfig: DesignSystemConfig = {
  name: 'Acme Design System',
  version: '0.1.0',
  packageName: '@acme/design-system',
  instructions: [
    'Prefer Acme components, tokens, icons, and patterns before custom UI.',
    'Use semantic tokens instead of hardcoded CSS values.',
    'Check accessibility guidance before shipping UI changes.',
  ].join(' '),
  tools: {
    enabled: [
      'init',
      'list_components',
      'get_component',
      'get_component_examples',
      'get_component_usage_guidelines',
      'get_component_accessibility_guidelines',
      'list_patterns',
      'get_pattern',
      'find_tokens',
      'get_token_group_bundle',
      'get_design_token_specs',
      'get_token_usage_patterns',
      'list_icons',
      'get_icon',
      'get_color_usage',
      'get_typography_usage',
      'coding_guidelines',
      'review_alt_text',
      'lint_css',
    ],
  },
};
