import type {
  ComponentCatalogAdapter,
  ComponentDetail,
  ComponentMeta,
  DesignSystemAdapters,
  IconCatalogAdapter,
  IconDetail,
  IconMeta,
  PatternCatalogAdapter,
  PatternDetail,
  PatternMeta,
  SnapshotCatalog,
  TokenCatalogAdapter,
  TokenGroup,
  TokenMeta,
} from '../types.js';

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function matchByIdOrName<T extends { id: string; name: string }>(
  items: T[],
  idOrName: string,
): T | undefined {
  const needle = normalize(idOrName);
  return items.find(
    (item) =>
      normalize(item.id) === needle ||
      normalize(item.name) === needle ||
      normalize(item.name).replace(/\s+/g, '') === needle.replace(/-/g, ''),
  );
}

export function createAdaptersFromSnapshot(snapshot: SnapshotCatalog): DesignSystemAdapters {
  const components = snapshot.components ?? [];
  const patterns = snapshot.patterns ?? [];
  const tokens = snapshot.tokens ?? [];
  const icons = snapshot.icons ?? [];

  const componentAdapter: ComponentCatalogAdapter = {
    listComponents: () => components,
    getComponent: (idOrName) => {
      const match = matchByIdOrName(components, idOrName);
      if (!match) return null;
      return {
        ...match,
        api: match.description ?? `Component API for ${match.name}.`,
      } satisfies ComponentDetail;
    },
    getExamples: (idOrName) => {
      const match = matchByIdOrName(components, idOrName);
      return match ? `Example usage for ${match.name} from ${match.importPath ?? 'your design system package'}.` : null;
    },
    getUsageGuidelines: (idOrName) => {
      const match = matchByIdOrName(components, idOrName);
      return match ? `Use ${match.name} for documented design-system scenarios. ${match.description ?? ''}`.trim() : null;
    },
    getAccessibilityGuidelines: (idOrName) => {
      const match = matchByIdOrName(components, idOrName);
      return match
        ? `Follow WCAG guidance for ${match.name}: provide labels, keyboard support, and visible focus states.`
        : null;
    },
  };

  const patternAdapter: PatternCatalogAdapter = {
    listPatterns: () => patterns,
    getPattern: (idOrName) => {
      const match = matchByIdOrName(patterns, idOrName);
      if (!match) return null;
      return {
        ...match,
        guidance: match.description ?? `Pattern guidance for ${match.name}.`,
      } satisfies PatternDetail;
    },
  };

  const tokenAdapter: TokenCatalogAdapter = {
    listGroups: () => [...new Set(tokens.map((token) => token.group).filter(Boolean) as string[])],
    findTokens: (query, group) => {
      const needle = query.toLowerCase();
      return tokens.filter((token) => {
        if (group && token.group !== group) return false;
        return (
          token.name.toLowerCase().includes(needle) ||
          token.description?.toLowerCase().includes(needle) ||
          token.value?.toLowerCase().includes(needle) ||
          token.cssVariable?.toLowerCase().includes(needle)
        );
      });
    },
    getGroupBundle: (group) => {
      const groupTokens = tokens.filter((token) => token.group === group);
      if (groupTokens.length === 0) return null;
      return {
        id: group,
        name: group,
        tokens: groupTokens,
      } satisfies TokenGroup;
    },
    getSpecs: () =>
      'Token specs:\n' +
      tokens
        .map((token) => `- ${token.name}${token.cssVariable ? ` (${token.cssVariable})` : ''}: ${token.value ?? 'n/a'}`)
        .join('\n'),
    getUsagePatterns: () =>
      'Prefer semantic tokens over raw values. Map color, spacing, and typography through design tokens before hardcoding CSS.',
  };

  const iconAdapter: IconCatalogAdapter = {
    listIcons: () => icons,
    getIcon: (name) => {
      const match =
        matchByIdOrName(
          icons.map((icon) => ({ ...icon, id: icon.id ?? icon.name })),
          name,
        ) ?? null;
      if (!match) return null;
      return {
        ...match,
        usage: `Import ${match.name} from your icon package and pair it with visible text or aria-label when needed.`,
      } satisfies IconDetail;
    },
  };

  return {
    components: componentAdapter,
    patterns: patternAdapter,
    tokens: tokenAdapter,
    icons: iconAdapter,
    docs: {
      getGettingStarted: () => snapshot.docs?.gettingStarted ?? 'Add getting-started docs to your snapshot or docs adapter.',
      getCodingGuidelines: () =>
        snapshot.docs?.codingGuidelines ??
        'Use design-system components, tokens, and documented patterns before creating custom UI.',
      getColorUsage: () => snapshot.docs?.colorUsage ?? 'Apply semantic color tokens for text, background, border, and status states.',
      getTypographyUsage: () =>
        snapshot.docs?.typographyUsage ?? 'Use typography tokens for headings, body text, captions, and labels.',
    },
    review: {
      reviewAltText: (altText, context) => {
        const trimmed = altText.trim();
        if (!trimmed) return 'Missing alt text. Add concise, purpose-driven alternative text.';
        if (/^(image|photo|picture)$/i.test(trimmed)) {
          return 'Alt text is too generic. Describe the meaning of the image in context.';
        }
        return context
          ? `Alt text "${trimmed}" looks reasonable for context: ${context}`
          : `Alt text "${trimmed}" looks reasonable. Verify it matches the UI purpose.`;
      },
      lintCss: (css) => {
        const findings: string[] = [];
        if (/#[0-9a-f]{3,8}/i.test(css)) findings.push('Hardcoded hex colors detected. Prefer design tokens.');
        if (/\b\d+px\b/.test(css)) findings.push('Hardcoded pixel values detected. Prefer spacing/size tokens.');
        return { ok: findings.length === 0, findings };
      },
    },
  };
}

export function mergeSnapshots(...snapshots: SnapshotCatalog[]): SnapshotCatalog {
  return snapshots.reduce<SnapshotCatalog>(
    (acc, snapshot) => ({
      components: [...(acc.components ?? []), ...(snapshot.components ?? [])],
      patterns: [...(acc.patterns ?? []), ...(snapshot.patterns ?? [])],
      tokens: [...(acc.tokens ?? []), ...(snapshot.tokens ?? [])],
      icons: [...(acc.icons ?? []), ...(snapshot.icons ?? [])],
      docs: { ...acc.docs, ...snapshot.docs },
    }),
    {},
  );
}
