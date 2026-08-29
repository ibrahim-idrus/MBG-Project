import { colors, spacing, borderRadius, typography } from './design-tokens.js';

export function getTailwindConfig(): string {
  const fontFamily: Record<string, string[]> = {};
  const fontSize: Record<string, [string, Record<string, string>]> = {};

  for (const [key, value] of Object.entries(typography)) {
    fontFamily[key] = ['Plus Jakarta Sans'];
    const config: Record<string, string> = {
      lineHeight: value.lineHeight,
      fontWeight: value.fontWeight,
    };
    if (value.letterSpacing) {
      config.letterSpacing = value.letterSpacing;
    }
    fontSize[key] = [value.fontSize, config];
  }

  const config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors,
        borderRadius,
        spacing,
        fontFamily,
        fontSize,
      },
    },
  };

  return JSON.stringify(config);
}
