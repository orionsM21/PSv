import {DefaultTheme} from '@react-navigation/native';
import {designTheme} from '../../design-system/theme';

export const appNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: designTheme.semanticColors.background,
    card: designTheme.semanticColors.surface,
    border: designTheme.semanticColors.border,
    primary: designTheme.semanticColors.primary,
    text: designTheme.semanticColors.textPrimary,
    notification: designTheme.semanticColors.danger,
  },
};

export const defaultStackScreenOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: designTheme.semanticColors.background,
  },
  headerStyle: {
    backgroundColor: designTheme.semanticColors.surface,
  },
  headerShadowVisible: false,
  headerTintColor: designTheme.semanticColors.textPrimary,
  headerTitleStyle: {
    ...designTheme.typography.bodyStrong,
  },
};
