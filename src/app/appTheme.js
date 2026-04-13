import {designTheme} from '../design-system/theme';

export const APP_THEME = {
  background: designTheme.colors.slate900,
  backgroundElevated: designTheme.colors.slate800,
  surface: 'rgba(255,255,255,0.08)',
  surfaceStrong: 'rgba(255,255,255,0.12)',
  surfaceLight: designTheme.colors.slate50,
  border: 'rgba(148,163,184,0.2)',
  textPrimary: designTheme.colors.slate50,
  textSecondary: '#A8B5C7',
  textMuted: '#7C8DA4',
  white: designTheme.colors.white,
  success: designTheme.semanticColors.success,
  danger: designTheme.semanticColors.danger,
  accent: designTheme.colors.blue400,
  overlayTop: designTheme.colors.overlayLight,
  overlayBottom: 'rgba(14,34,57,0.04)',
  statusBar: designTheme.colors.slate900,
};

export const APP_GRADIENT = designTheme.gradients.app;
