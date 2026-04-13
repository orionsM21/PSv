import React from "react";
import { View, StyleSheet } from "react-native";

export default function TurnArrow() {
  return (
    <View style={styles.arrow} />
  );
}

const styles = StyleSheet.create({
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#2563EB", // Google blue
  },
});
