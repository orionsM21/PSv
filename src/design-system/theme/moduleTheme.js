import {colors, semanticColors} from './colors';
import {shadows} from './shadows';
import {spacing} from './spacing';
import {typography} from './typography';

const baseTheme = {
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

export const createModuleTheme = ({
  id,
  title,
  accent = semanticColors.primary,
  gradient = baseTheme.gradients.primary,
}) => ({
  ...baseTheme,
  moduleId: id,
  moduleTitle: title,
  moduleAccent: accent,
  moduleGradient: gradient,
});
