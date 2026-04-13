import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {DrawerContext} from './DrawerContext';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

export default function DrawerBase({children}) {
  const {isOpen, closeDrawer} = useContext(DrawerContext);
  const {width} = useWindowDimensions();
  const drawerWidth = useMemo(() => Math.min(width * 0.84, 360), [width]);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(
        isOpen ? 'rgba(0,0,0,0.4)' : '#0B1220',
        true,
      );
    }

    StatusBar.setBarStyle('light-content', true);
  }, [isOpen]);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -drawerWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [drawerWidth, isOpen, translateX]);

  useEffect(() => {
    if (!isOpen) {
      translateX.setValue(-drawerWidth);
    }
  }, [drawerWidth, isOpen, translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(Math.max(-drawerWidth, gesture.dx));
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -drawerWidth / 3) {
          closeDrawer();
          return;
        }

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  if (!isOpen) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={closeDrawer} />

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            paddingTop: STATUS_BAR_HEIGHT,
            transform: [{translateX}],
          },
        ]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    height: '100%',
    backgroundColor: '#020617',
  },
});
