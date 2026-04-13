import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLUMN_WIDTH = SCREEN_WIDTH / 3.2; // better spacing for long text

const TableHeader = ({ headers }) => {
  return (
    <View style={styles.headerRow}>
      {headers.map((h, index) => (
        <View key={index} style={styles.headerCell}>
          <Text style={styles.headerText} numberOfLines={1}>
            {h}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 10,
  },
  headerCell: {
    width: COLUMN_WIDTH,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
});

export default TableHeader;


// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// const TableHeader = () => {
//   return (
//     <View style={styles.headerRow}>
//       <Text style={[styles.headerCell, { flex: 1 }]}>Activity</Text>
//       <Text style={[styles.headerCell, { flex: 1.4 }]}>Details</Text>
//       <Text style={[styles.headerCell, { flex: 1 }]}>Duration</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   headerRow: {
//     flexDirection: "row",
//     backgroundColor: "#F1F5F9",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E2E8F0",
//   },
//   headerCell: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#334155",
//     textAlign: "center",
//   },
// });

// export default TableHeader;
