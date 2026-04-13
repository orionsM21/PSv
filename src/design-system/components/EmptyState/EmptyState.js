import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Button from '../Button/Button';
import {designTheme} from '../../theme';

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'The requested content is not available right now.',
  actionLabel,
  onActionPress,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onActionPress ? (
        <Button
          label={actionLabel}
          variant="secondary"
          onPress={onActionPress}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: designTheme.spacing[6],
    paddingHorizontal: designTheme.spacing[4],
    borderRadius: designTheme.radii.lg,
    backgroundColor: designTheme.semanticColors.surface,
    borderWidth: 1,
    borderColor: designTheme.semanticColors.border,
  },
  title: {
    ...designTheme.typography.h3,
    textAlign: 'center',
  },
  description: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[2],
    textAlign: 'center',
    color: designTheme.semanticColors.textSecondary,
  },
  button: {
    marginTop: designTheme.spacing[4],
    minWidth: 160,
  },
});
