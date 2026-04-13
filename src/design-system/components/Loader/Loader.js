import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { designTheme } from '../../theme';

export default function Loader({ label = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={designTheme.semanticColors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTheme.spacing[6],
  },
  label: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[3],
    color: designTheme.semanticColors.textSecondary,
  },
});
