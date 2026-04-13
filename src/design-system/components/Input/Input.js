import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { designTheme } from '../../theme';

export default function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  ...props
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={designTheme.semanticColors.textMuted}
        style={[styles.input, error && styles.inputError, inputStyle]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...designTheme.typography.caption,
    marginBottom: designTheme.spacing[2],
    color: designTheme.semanticColors.textPrimary,
  },
  input: {
    minHeight: 48,
    borderRadius: designTheme.radii.md,
    borderWidth: 1,
    borderColor: designTheme.semanticColors.border,
    backgroundColor: designTheme.semanticColors.surface,
    paddingHorizontal: designTheme.spacing[4],
    color: designTheme.semanticColors.textPrimary,
  },
  inputError: {
    borderColor: designTheme.semanticColors.danger,
  },
  error: {
    ...designTheme.typography.caption,
    marginTop: designTheme.spacing[1],
    color: designTheme.semanticColors.danger,
  },
});
