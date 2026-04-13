import React from 'react';
import { StyleSheet, View } from 'react-native';
import { designTheme } from '../../theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designTheme.radii.lg,
    backgroundColor: designTheme.semanticColors.surface,
    borderWidth: 1,
    borderColor: designTheme.semanticColors.border,
    padding: designTheme.spacing[4],
    ...designTheme.shadows.sm,
  },
});
