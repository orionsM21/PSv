import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {APP_GRADIENT, APP_THEME} from './appTheme';

export default function AppLayout({children, withSafeArea = false}) {
  const content = (
    <LinearGradient colors={APP_GRADIENT} style={styles.background}>
      <StatusBar
        backgroundColor={APP_THEME.statusBar}
        barStyle="light-content"
        translucent={false}
      />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );

  if (withSafeArea) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {content}
      </SafeAreaView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_THEME.statusBar,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
