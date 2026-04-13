import React, { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button, Modal } from '../../design-system/components';
import { designTheme } from '../../design-system/theme';
import { useUpdateManager } from './useUpdateManager';

export default function UpdateGate() {
  const { loading, updateInfo } = useUpdateManager();
  const [dismissedVersion, setDismissedVersion] = useState(null);

  const isVisible = useMemo(() => {
    if (!updateInfo?.shouldUpdate) {
      return false;
    }

    if (updateInfo.forceUpdate) {
      return true;
    }

    return dismissedVersion !== updateInfo.latestVersion;
  }, [dismissedVersion, updateInfo]);

  if (loading || !isVisible) {
    return null;
  }

  const handleOpenUrl = async () => {
    if (!updateInfo?.storeUrl) {
      return;
    }

    await Linking.openURL(updateInfo.storeUrl);
  };

  return (
    <Modal
      visible
      onRequestClose={() => setDismissedVersion(updateInfo.latestVersion)}
      dismissOnBackdrop={!updateInfo.forceUpdate}
    >
      <Text style={styles.title}>
        {updateInfo.forceUpdate ? 'Update required' : 'Update available'}
      </Text>
      <Text style={styles.body}>
        {updateInfo.releaseNotes ||
          'A newer app version is available with stability and UX improvements.'}
      </Text>
      <View style={styles.buttonStack}>
        <Button label="Update now" onPress={handleOpenUrl} />
        {!updateInfo.forceUpdate ? (
          <Button
            label="Later"
            variant="secondary"
            onPress={() => setDismissedVersion(updateInfo.latestVersion)}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    ...designTheme.typography.h3,
  },
  body: {
    ...designTheme.typography.body,
    marginTop: designTheme.spacing[3],
    color: designTheme.semanticColors.textSecondary,
  },
  buttonStack: {
    marginTop: designTheme.spacing[5],
    gap: designTheme.spacing[3],
  },
});
