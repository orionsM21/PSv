// /screens/MyVisit/MarkerItem.js
import React, { memo } from "react";
import { Marker, Callout } from "react-native-maps";
import { Text, View, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const statusColor = {
  Pending: "#F5B041",
  Completed: "#229954",
  Cancelled: "#D64550",
};

function MarkerItem({ item, onPress: handlePress }) {
  if (!item?.latitude || !item?.longitude) return null;

  const color = statusColor[item.status] || "#3B82F6";

  return (
    <Marker
      coordinate={{
        latitude: item.latitude,
        longitude: item.longitude,
      }}
      onPress={() => handlePress?.(item)}
      anchor={{ x: 0.5, y: 1 }}
    >
      <MaterialIcons name="location-on" size={32} color={color} />

      <Callout tooltip>
        <View style={styles.callout}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.sub}>{item.address}</Text>

          <View style={styles.row}>
            <Text style={[styles.badge, { backgroundColor: color }]}>
              {item.status}
            </Text>
            <Text style={styles.time}>{item.travelTime || "—"}</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  callout: {
    width: 230,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  title: { fontSize: 14, fontWeight: "700", color: "#111" },
  sub: { fontSize: 13, color: "#444", marginTop: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
  badge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "700",
  },
  time: { color: "#333", fontWeight: "600" },
});

export default memo(MarkerItem);
