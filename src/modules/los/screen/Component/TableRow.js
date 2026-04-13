import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const COLUMN_WIDTH = SCREEN_WIDTH / 3.2;

const TableRow = ({ data, index }) => {
  const values = [
    data.description,
    data.stage,
    data.type,
    data.status,
    data.user,
    new Date(data.createdTime).toLocaleDateString("en-GB").replace(/\//g, "-"),
    new Date(data.lastModifiedTime).toLocaleDateString("en-GB").replace(/\//g, "-"),
  ];

  return (
    <View style={[styles.row, index % 2 === 0 ? styles.even : styles.odd]}>
      {values.map((value, i) => (
        <View key={i} style={styles.cell}>
          <Text style={styles.cellText}>{value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  even: { backgroundColor: "#FFFFFF" },
  odd: { backgroundColor: "#F8FAFC" },

  cell: {
    width: COLUMN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cellText: {
    fontSize: 11,
    color: "#475569",
    textAlign: "center",
    flexWrap: "wrap",
  },
});

export default TableRow;


// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// const TableRow = ({ data, index }) => {

//   return (
//     <View style={[styles.row, index % 2 === 0 ? styles.even : styles.odd]}>

//       {/* COLUMN 1 — Activity */}
//       <View style={[styles.col, { flex: 1 }]}>
//         <Text style={styles.activityText}>{data.description}</Text>
//       </View>

//       {/* COLUMN 2 — Details (stacked) */}
//       <View style={[styles.col, { flex: 1.4, alignItems: "flex-start" }]}>
//         <Text style={styles.detail}><Text style={styles.bold}>Stage:</Text> {data.stage}</Text>
//         <Text style={styles.detail}><Text style={styles.bold}>Type:</Text> {data.type}</Text>
//         <Text style={styles.detail}><Text style={styles.bold}>Status:</Text> {data.status}</Text>
//         <Text style={styles.detail}><Text style={styles.bold}>User:</Text> {data.user}</Text>
//       </View>

//       {/* COLUMN 3 — Date Range */}
//       <View style={[styles.col, { flex: 1 }]}>
//         <Text style={styles.dateText}>
//           {new Date(data.createdTime).toLocaleDateString("en-GB")}
//         </Text>
//         <Text style={styles.arrow}>→</Text>
//         <Text style={styles.dateText}>
//           {new Date(data.lastModifiedTime).toLocaleDateString("en-GB")}
//         </Text>
//       </View>

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: "row",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   even: { backgroundColor: "#FFFFFF" },
//   odd: { backgroundColor: "#F8FAFC" },

//   col: {
//     justifyContent: "center",
//     paddingHorizontal: 10,
//   },

//   activityText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#1E293B",
//     textAlign: "center",
//   },

//   detail: {
//     fontSize: 11,
//     color: "#475569",
//     marginBottom: 2,
//   },

//   bold: {
//     fontWeight: "700",
//     color: "#1E293B",
//   },

//   dateText: {
//     fontSize: 11,
//     color: "#1E293B",
//     textAlign: "center",
//   },

//   arrow: {
//     textAlign: "center",
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
// });

// export default TableRow;
