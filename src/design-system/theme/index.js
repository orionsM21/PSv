import {colors, semanticColors} from './colors';
import {shadows} from './shadows';
import {spacing} from './spacing';
import {typography} from './typography';

export const designTheme = {
  colors,
  semanticColors,
  spacing,
  typography,
  shadows,
  gradients: {
    app: ['#07101E', '#0B1830', '#0C1424'],
    primary: ['#082032', '#0B3C73', '#22A2FF'],
    accent: ['#082032', '#0F4C5C', '#1B8A8F'],
  },
  radii: {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 28,
    pill: 999,
  },
};

export * from './colors';
export * from './shadows';
export * from './spacing';
export * from './typography';
export * from './moduleTheme';
