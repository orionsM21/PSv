import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const ITEMS = [
  { field: "ot", label: "Other Charges", icon: "receipt-long" },
  { field: "dpc", label: "DPC / LPP", icon: "report-gmailerrorred" },
  { field: "chequeBounce", label: "Cheque Bounce", icon: "dangerous" },
];

const DeluxeChargesSelector = ({ form, update }) => {
  return (
    <View style={styles.container}>
      {ITEMS.map((c) => {
        const active = form.charges[c.field];

        const scaleAnim = useRef(new Animated.Value(1)).current;

        const pressIn = () =>
          Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
          }).start();

        const pressOut = () =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }).start();

        return (
          <Pressable
            key={c.field}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={() =>
              update("charges", { ...form.charges, [c.field]: !active })
            }
            style={styles.pressArea}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              {active ? (
                <LinearGradient
                  colors={["#001B5E", "#2743A6", "#6F2DBD"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeCard}
                >
                  <MaterialIcons
                    name={c.icon}
                    size={scale(18)}
                    color="#fff"
                    style={styles.icon}
                  />
                  <Text style={styles.activeText}>{c.label}</Text>

                  {/* Shine Overlay */}
                  <LinearGradient
                    colors={["rgba(255,255,255,0.18)", "transparent"]}
                    style={styles.shine}
                  />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveCard}>
                  <MaterialIcons
                    name={c.icon}
                    size={scale(18)}
                    color="#666"
                    style={styles.icon}
                  />
                  <Text style={styles.inactiveText}>{c.label}</Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default React.memo(DeluxeChargesSelector);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: verticalScale(10),
  },

  pressArea: {
    width: "47%", // ⭐ Perfect compact 2-column layout
    marginBottom: verticalScale(12),
  },

  /* ACTIVE STATE */
  activeCard: {
    paddingVertical: verticalScale(10), // reduced
    borderRadius: moderateScale(12), // reduced from 16
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15, // reduced
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,

    position: "relative",
    overflow: "hidden",
  },

  shine: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "40%", // reduced
  },

  icon: {
    marginBottom: verticalScale(2), // reduced spacing
  },

  activeText: {
    color: "#fff",
    fontSize: moderateScale(12.5), // reduced
    fontWeight: "700",
    textAlign: "center",
  },

  /* INACTIVE STATE */
  inactiveCard: {
    paddingVertical: verticalScale(10),
    backgroundColor: "#F4F5F7",
    borderRadius: moderateScale(12),
    borderWidth: scale(1),
    borderColor: "#DADDE2",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.04, // smaller shadow
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },

  inactiveText: {
    color: "#444",
    fontSize: moderateScale(12.5), // reduced
    fontWeight: "600",
    textAlign: "center",
  },
});
