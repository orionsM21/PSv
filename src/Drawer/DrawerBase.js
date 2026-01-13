import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
  StatusBar,
  Platform,
} from "react-native";
import { DrawerContext } from "./DrawerContext";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(width * 0.82, 340);
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

export default function DrawerBase({ children }) {
  const { isOpen, closeDrawer } = useContext(DrawerContext);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  /* ---------------- STATUS BAR ---------------- */
  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(
        isOpen ? "rgba(0,0,0,0.4)" : "#0B1220",
        true
      );
    }
    StatusBar.setBarStyle("light-content", true);
  }, [isOpen]);

  /* ---------------- ANIMATION ---------------- */
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -DRAWER_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  /* ---------------- SWIPE ---------------- */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,

      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(-DRAWER_WIDTH, g.dx));
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dx < -DRAWER_WIDTH / 3) {
          closeDrawer();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* BACKDROP */}
      <Pressable style={styles.backdrop} onPress={closeDrawer} />

      {/* DRAWER */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.drawer,
          {
            paddingTop: STATUS_BAR_HEIGHT, // ✅ KEY FIX
            transform: [{ translateX }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#020617",
  },
});
