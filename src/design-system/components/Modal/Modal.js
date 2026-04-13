import React from 'react';
import {
  Modal as NativeModal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Card from '../Card/Card';
import { designTheme } from '../../theme';

export default function Modal({
  visible,
  children,
  onRequestClose,
  dismissOnBackdrop = true,
}) {
  return (
    <NativeModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={dismissOnBackdrop ? onRequestClose : undefined}
      >
        <Pressable>
          <Card style={styles.content}>{children}</Card>
        </Pressable>
      </Pressable>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: designTheme.colors.overlayDark,
    justifyContent: 'center',
    paddingHorizontal: designTheme.spacing[4],
  },
  content: {
    padding: designTheme.spacing[5],
  },
});
