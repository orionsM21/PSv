import React from "react";
import { View, StyleSheet } from "react-native";

const SkeletonCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.lineShort} />
      <View style={styles.lineLong} />
      <View style={styles.row}>
        <View style={styles.badge} />
        <View style={styles.badgeSmall} />
      </View>
    </View>
  );
};

export const SkeletonList = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
};

export default SkeletonCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 16,
    elevation: 2,
  },
  lineShort: {
    height: 14,
    width: "40%",
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
  lineLong: {
    height: 14,
    width: "80%",
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  badge: {
    width: 80,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  badgeSmall: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
});
