import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { designTheme } from '../../theme';

const VARIANTS = {
  primary: {
    backgroundColor: designTheme.semanticColors.primary,
    borderColor: designTheme.semanticColors.primary,
    textColor: designTheme.semanticColors.textInverse,
  },
  secondary: {
    backgroundColor: designTheme.semanticColors.surface,
    borderColor: designTheme.semanticColors.border,
    textColor: designTheme.semanticColors.textPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: designTheme.semanticColors.primary,
  },
  danger: {
    backgroundColor: designTheme.semanticColors.danger,
    borderColor: designTheme.semanticColors.danger,
    textColor: designTheme.semanticColors.textInverse,
  },
};

export default function Button({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
}) {
  const palette = VARIANTS[variant] || VARIANTS.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : (
        <Text style={[styles.label, { color: palette.textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: designTheme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: designTheme.spacing[4],
    borderWidth: 1,
  },
  label: {
    ...designTheme.typography.bodyStrong,
  },
});
