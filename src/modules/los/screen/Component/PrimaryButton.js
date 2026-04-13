import React, { memo } from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const PrimaryButton = memo(
  ({
    title,
    onPress,
    loading = false,
    disabled = false,
    gradientColors = ["#2C60D1FF"], // default gradient (same as ProductDetailsCard)
    style,
    textStyle,
  }) => {
    const isDisabled = disabled || loading;

    return (
      <LinearGradient
        colors={isDisabled ? ["#BDBDBD", "#9E9E9E"] : gradientColors}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientWrapper, style]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          disabled={isDisabled}
          style={styles.innerButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    );
  }
);

export default PrimaryButton;

const styles = StyleSheet.create({
  gradientWrapper: {
    borderRadius: 12,
    padding: 2,
    marginTop: 12,
  },
  innerButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
