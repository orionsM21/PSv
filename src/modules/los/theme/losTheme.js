export const losColors = {
  brand: {
    900: '#082032',
    800: '#0B3C73',
    700: '#0E4F9C',
    600: '#0F6CBD',
    500: '#1E6FD9',
    400: '#22A2FF',
    300: '#67E8F9',
  },
  surface: {
    canvas: '#F1F6FD',
    mutedCanvas: '#F2F7F8',
    card: '#FFFFFF',
    darkCard: '#0D1F2D',
    tintBlue: '#EAF4FF',
    tintMint: '#ECFDF5',
    tintOrange: '#FFF7ED',
    tintRose: '#FFF1F2',
    border: 'rgba(14, 34, 57, 0.08)',
  },
  text: {
    primary: '#0E2239',
    secondary: '#5C7089',
    tertiary: '#64748B',
    inverse: '#FFFFFF',
    inverseMuted: 'rgba(255,255,255,0.74)',
  },
  state: {
    success: '#10B981',
    warning: '#F97316',
    danger: '#EF4444',
    info: '#2563EB',
    accent: '#0F766E',
    purple: '#8B5CF6',
    cyan: '#0EA5E9',
  },
};

export const losGradients = {
  salesHero: ['#072B61', '#0E4F9C', '#22A2FF'],
  creditHero: ['#082032', '#0F4C5C', '#1B8A8F'],
  classicHero: ['#0B4D96', '#1E6FD9', '#4AA3FF'],
};

export const losRadii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
};

export const losSpacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const losThemes = {
  dashboard: {
    pageBackground: losColors.surface.canvas,
    cardBackground: losColors.surface.card,
    headerGradient: losGradients.classicHero,
    accent: losColors.brand[600],
    accentSoft: 'rgba(15, 108, 189, 0.12)',
    accentGlow: 'rgba(34, 162, 255, 0.24)',
    textPrimary: losColors.text.primary,
    textSecondary: losColors.text.secondary,
    border: losColors.surface.border,
    success: losColors.state.success,
  },
  salesCommand: {
    pageBackground: losColors.surface.canvas,
    cardBackground: losColors.surface.card,
    headerGradient: losGradients.salesHero,
    accent: losColors.state.info,
    accentSoft: 'rgba(37, 99, 235, 0.12)',
    accentGlow: 'rgba(34, 162, 255, 0.26)',
    textPrimary: losColors.text.primary,
    textSecondary: losColors.text.secondary,
    border: losColors.surface.border,
    success: losColors.state.success,
  },
  creditCommand: {
    pageBackground: losColors.surface.mutedCanvas,
    cardBackground: losColors.surface.card,
    headerGradient: losGradients.creditHero,
    accent: losColors.state.accent,
    accentSoft: 'rgba(15, 118, 110, 0.12)',
    accentGlow: 'rgba(34, 211, 238, 0.22)',
    textPrimary: '#0D1F2D',
    textSecondary: losColors.text.secondary,
    border: losColors.surface.border,
    success: losColors.state.success,
  },
};
