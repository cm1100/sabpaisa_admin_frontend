/**
 * Theme Presets
 * Curated brand palettes for quick theme switching
 */

export type ThemePresetKey =
  | 'indigo'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'ocean'
  | 'neutral';

export interface ThemePreset {
  label: string;
  accent: string; // primary color
}

export const themePresets: Record<ThemePresetKey, ThemePreset> = {
  indigo: { label: 'Indigo', accent: '#635BFF' },
  emerald: { label: 'Emerald', accent: '#10B981' },
  rose: { label: 'Rose', accent: '#EF4444' },
  amber: { label: 'Amber', accent: '#F59E0B' },
  ocean: { label: 'Ocean', accent: '#0EA5E9' },
  neutral: { label: 'Neutral', accent: '#64748B' },
};

