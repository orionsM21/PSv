import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {
  Button,
  Card,
  ErrorState,
  Input,
} from '../../../design-system/components';
import {designTheme} from '../../../design-system/theme';
import ChatModuleShell from './ChatModuleShell';

export default function AddContactView({
  name,
  phone,
  loading,
  error,
  canOpenSettings,
  onNameChange,
  onPhoneChange,
  onSubmit,
  onOpenSettings,
  onBack,
}) {
  return (
    <ChatModuleShell
      title="Add Contact"
      subtitle="Save a customer contact to your device so they can appear in chat discovery."
      scroll={false}
      contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.formTitle}>New device contact</Text>
        <Text style={styles.formBody}>
          Add a contact name and optional mobile number. This improves chat
          matching on the device.
        </Text>

        <Input
          label="Contact name"
          value={name}
          onChangeText={onNameChange}
          placeholder="Enter customer name"
          containerStyle={styles.field}
        />

        <Input
          label="Mobile number"
          value={phone}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
          placeholder="Optional mobile number"
        />

        {error ? (
          <ErrorState
            title="Unable to add contact"
            description={error}
            actionLabel={canOpenSettings ? 'Open Settings' : undefined}
            onActionPress={canOpenSettings ? onOpenSettings : undefined}
          />
        ) : null}

        <Button
          label="Save Contact"
          onPress={onSubmit}
          loading={loading}
          style={styles.primaryAction}
        />
        <Button
          label="Back"
          variant="secondary"
          onPress={onBack}
          style={styles.secondaryAction}
        />
      </Card>
    </ChatModuleShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  formTitle: {
    ...designTheme.typography.h3,
  },
  formBody: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[2],
    color: designTheme.semanticColors.textSecondary,
  },
  field: {
    marginTop: designTheme.spacing[5],
    marginBottom: designTheme.spacing[4],
  },
  primaryAction: {
    marginTop: designTheme.spacing[4],
  },
  secondaryAction: {
    marginTop: designTheme.spacing[3],
  },
});
