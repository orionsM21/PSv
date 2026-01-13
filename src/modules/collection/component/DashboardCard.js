import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { scale, verticalScale, moderateScale, ms } from "react-native-size-matters";

const { width } = Dimensions.get("window");

const DashboardCard = ({
  icon,
  value,
  label,
  subLabel,
  onPress,
  disabled,
  valueColor = "#111",
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={styles.card}
    >
      <LinearGradient colors={["#FFFFFF", "#F4F2F2"]} style={styles.actionButton}>
        <View style={styles.row}>
          {icon && (
            <Image source={icon} style={styles.icon} resizeMode="contain" />
          )}

          <Text numberOfLines={1} style={[styles.value, { color: valueColor }]}>
            {value ?? "—"}
          </Text>
        </View>

        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>

        {subLabel && (
          <Text numberOfLines={1} style={styles.subLabel}>
            {subLabel}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default memo(DashboardCard);

const styles = StyleSheet.create({
  card: {
    width: (width - moderateScale(30)) / 2,
    padding: moderateScale(6),
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    width: "100%",
    paddingVertical: scale(10),
    paddingHorizontal: scale(8),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: verticalScale(4),
    alignItems: "center",
  },
  icon: {
    width: scale(20),
    height: scale(20),
    marginRight: scale(6),
    tintColor: "#001D56",
  },
  value: {
    fontSize: ms(14),
    fontWeight: "700",
  },
  label: {
    marginTop: verticalScale(4),
    fontSize: ms(11),
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
    width: "100%",
  },
  subLabel: {
    marginTop: verticalScale(2),
    fontSize: ms(10),
    color: "#9AA1AA",
    textAlign: "center",
    width: "100%",
  },
});
