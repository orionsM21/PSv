import { semanticColors } from './colors';

export const typography = {
  h1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: semanticColors.textPrimary,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: semanticColors.textPrimary,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: semanticColors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: semanticColors.textPrimary,
  },
  bodyStrong: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: semanticColors.textPrimary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: semanticColors.textSecondary,
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: semanticColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
};
