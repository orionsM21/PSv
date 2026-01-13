import React, { memo, useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const CustomerExistsModal = memo(({ visible, data = [], onProceed, onCancel }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const [index, setIndex] = useState(0);
  const item = data[index]; // ✅ CURRENT ITEM

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* HEADER */}
          <LinearGradient
            colors={["#0B3480", "#2751C3", "#4A72E8"]}
            style={styles.header}
          >
            <Text style={styles.headerText}>Aphelion Finance PVT LTD</Text>
          </LinearGradient>

          {/* PAN INFO */}
          <Text style={styles.panText}>
            Entered PAN No: <Text style={styles.bold}>{item.pan}</Text>{"\n"}
            already exists in the system!
          </Text>

          {/* DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details are as follows:</Text>
            <Text style={styles.text}>Case No: {item.lan || '---'} (As an {`${item.applicantTypeCode}`})</Text>
            <Text style={styles.text}>Application No: {item.applicationNo || '---'}</Text>
            <Text style={styles.text}>Name: {item.name}</Text>
            <Text style={styles.text}>Login Date: {item.loginDate}</Text>
            <Text style={styles.text}>Case Type: {item.caseType || '---'}</Text>
            <Text style={styles.text}>Case Status: {item.caseStatus || item.Status || '---'}</Text>
            <Text style={styles.text}>Executive: {item.executive}</Text>
            <Text style={styles.text}>Dealer: {item.dealer}</Text>
          </View>

          {/* 🔁 MULTIPLE INDICATOR (NO UI CHANGE) */}
          {data.length > 1 && (
            <View style={styles.switchRow}>
              <TouchableOpacity
                disabled={index === 0}
                onPress={() => setIndex(i => i - 1)}
              >
                <Text style={[styles.switchText, index === 0 && styles.disabled]}>
                  ◀ Prev
                </Text>
              </TouchableOpacity>

              <Text style={styles.switchText}>
                {index + 1} / {data.length}
              </Text>

              <TouchableOpacity
                disabled={index === data.length - 1}
                onPress={() => setIndex(i => i + 1)}
              >
                <Text
                  style={[
                    styles.switchText,
                    index === data.length - 1 && styles.disabled,
                  ]}
                >
                  Next ▶
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* BUTTONS */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.proceedBtn} onPress={() => onProceed(item)}>
              <Text style={styles.btnText}>Proceed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

export default CustomerExistsModal;

// /* ---------------------------------------------------------
//    ULTRA DELUXE STYLES
// --------------------------------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(16),
  },

  card: {
    width: "95%",
    // backgroundColor: "rgba(255,255,255,0.15)",
    backgroundColor: '#F1F1F1FF',
    borderRadius: moderateScale(16),
    paddingBottom: verticalScale(20),
    overflow: "hidden",
    borderWidth: scale(1),
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },

  header: {
    paddingVertical: verticalScale(14),
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  panText: {
    marginTop: verticalScale(14),
    textAlign: "center",
    fontSize: moderateScale(14),
    color: "#1E2A46",
    paddingHorizontal: scale(14),
    fontWeight: "600",
  },

  bold: {
    fontWeight: "800",
    color: "#0B3480",
  },

  section: {
    marginTop: verticalScale(16),
    paddingHorizontal: scale(18),
  },

  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    marginBottom: verticalScale(8),
    color: "#1A1A1A",
  },

  text: {
    fontSize: moderateScale(13),
    marginBottom: verticalScale(5),
    color: "#2A2A2A",
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(18),
    paddingHorizontal: scale(18),
  },

  proceedBtn: {
    flex: 1,
    backgroundColor: "#1E8F3C",
    paddingVertical: verticalScale(10),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(10),
    marginRight: scale(8),
    elevation: 5,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#D9534F",
    paddingVertical: verticalScale(10),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: moderateScale(10),
    elevation: 5,
  },

  btnText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "700",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    marginTop: verticalScale(10),
  },

  switchText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#0B3480",
  },

  disabled: {
    opacity: 0.3,
  },

});



// import React, { memo, useEffect, useRef, useState } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import { scale, verticalScale, moderateScale } from "react-native-size-matters";

// const CustomerExistsModal = memo(({ visible, data = [], onProceed, onCancel }) => {
//   if (!Array.isArray(data) || data.length === 0) return null;

//   const [index, setIndex] = useState(0);
//   const item = data[index]; // ✅ CURRENT ITEM

//   const scaleAnim = useRef(new Animated.Value(0.85)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       Animated.parallel([
//         Animated.spring(scaleAnim, {
//           toValue: 1,
//           useNativeDriver: true,
//           friction: 6,
//         }),
//         Animated.timing(opacityAnim, {
//           toValue: 1,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [visible]);

//   return (
//     <Modal visible={visible} transparent animationType="none">
//       <View style={styles.overlay}>
//         <Animated.View
//           style={[
//             styles.card,
//             {
//               opacity: opacityAnim,
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//         >
//           {/* HEADER */}
//           <LinearGradient
//             colors={["#0B3480", "#2751C3", "#4A72E8"]}
//             style={styles.header}
//           >
//             <Text style={styles.headerText}>Aphelion Finance PVT LTD</Text>
//           </LinearGradient>

//           {/* PAN INFO */}
//           <Text style={styles.panText}>
//             Entered PAN No: <Text style={styles.bold}>{item.pan}</Text>{"\n"}
//             already exists in the system!
//           </Text>

//           {/* DETAILS */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Details are as follows:</Text>

//             <Text style={styles.text}>Application No: {item.applicationNo}</Text>
//             <Text style={styles.text}>Name: {item.name}</Text>
//             <Text style={styles.text}>Login Date: {item.loginDate}</Text>
//             <Text style={styles.text}>Case Type: {item.caseType}</Text>
//             <Text style={styles.text}>Case Status: {item.caseStatus || item.Status}</Text>
//             <Text style={styles.text}>Executive: {item.executive}</Text>
//             <Text style={styles.text}>Dealer: {item.dealer}</Text>
//           </View>

//           {/* 🔁 MULTIPLE INDICATOR (NO UI CHANGE) */}
//           {data.length > 1 && (
//             <View style={styles.switchRow}>
//               <TouchableOpacity
//                 disabled={index === 0}
//                 onPress={() => setIndex(i => i - 1)}
//               >
//                 <Text style={[styles.switchText, index === 0 && styles.disabled]}>
//                   ◀ Prev
//                 </Text>
//               </TouchableOpacity>

//               <Text style={styles.switchText}>
//                 {index + 1} / {data.length}
//               </Text>

//               <TouchableOpacity
//                 disabled={index === data.length - 1}
//                 onPress={() => setIndex(i => i + 1)}
//               >
//                 <Text
//                   style={[
//                     styles.switchText,
//                     index === data.length - 1 && styles.disabled,
//                   ]}
//                 >
//                   Next ▶
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* BUTTONS */}
//           <View style={styles.btnRow}>
//             <TouchableOpacity style={styles.proceedBtn} onPress={() => onProceed(item)}>
//               <Text style={styles.btnText}>Proceed</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
//               <Text style={styles.btnText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// });

// export default CustomerExistsModal;

// import React, { memo, useState } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
// } from "react-native";
// import { scale, verticalScale, moderateScale } from "react-native-size-matters";

// const CustomerExistsModal = memo(({ visible, data = [], onProceed, onCancel }) => {
//   const [selectedIndex, setSelectedIndex] = useState(0);

//   if (!visible || data.length === 0) return null;

//   const renderItem = ({ item, index }) => {
//     const selected = selectedIndex === index;

//     return (
//       <TouchableOpacity
//         activeOpacity={1}
//         onPress={() => setSelectedIndex(index)}
//         style={styles.caseWrapper}
//       >
//         <Text style={styles.blockText}>
//           {`Entered PAN No: ${item.pan} already Exist !!!
// Details are as follows:-

// Case No: ${item.applicationNo} (As an ${item.applicantTypeCode})
// Name: ${item.name}
// Login ID: ${item.loginId || "-"}
// Login Date: ${item.loginDate}
// Case Type: ${item.caseType}
// Case Status: ${item.Status || item.caseStatus}
// Executive: ${item.executive}
// Dealer: ${item.dealer}
// ------------------------------------------------`}
//         </Text>

//         {selected && <Text style={styles.selectedHint}>▶ Selected</Text>}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           {/* 🔵 TITLE BAR */}
//           <View style={styles.header}>
//             <Text style={styles.headerText}>Aphelion Finance PVT LTD</Text>
//             <TouchableOpacity onPress={onCancel}>
//               <Text style={styles.close}>✕</Text>
//             </TouchableOpacity>
//           </View>

//           {/* 🔽 CONTENT */}
//           <FlatList
//             data={data}
//             keyExtractor={(item, idx) =>
//               `${item.applicationNo}-${idx}`
//             }
//             renderItem={renderItem}
//             showsVerticalScrollIndicator
//           />

//           {/* 🔘 ACTIONS */}
//           <View style={styles.btnRow}>
//             <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
//               <Text style={styles.btnText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.proceedBtn}
//               onPress={() => onProceed(data[selectedIndex])}
//             >
//               <Text style={styles.btnText}>Proceed</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// });

// export default CustomerExistsModal;





/* ---------------------------------------------------------
   ULTRA DELUXE STYLES
--------------------------------------------------------- */

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "center",
//     padding: scale(16),
//   },

//   container: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 2,
//     borderWidth: 1,
//     borderColor: "#9AA7B8",
//     maxHeight: "85%",
//   },

//   header: {
//     backgroundColor: "#B9CDE5",
//     paddingVertical: verticalScale(6),
//     paddingHorizontal: scale(10),
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   headerText: {
//     fontSize: moderateScale(13),
//     fontWeight: "700",
//     color: "#000",
//   },

//   close: {
//     fontSize: moderateScale(14),
//     fontWeight: "700",
//   },

//   caseWrapper: {
//     paddingHorizontal: scale(10),
//     paddingVertical: verticalScale(8),
//   },

//   blockText: {
//     fontSize: moderateScale(12.5),
//     fontFamily: "monospace",
//     lineHeight: verticalScale(17),
//     color: "#000",
//   },

//   selectedHint: {
//     marginTop: verticalScale(4),
//     fontSize: moderateScale(11),
//     color: "#1E8F3C",
//     fontWeight: "600",
//   },

//   btnRow: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     padding: scale(10),
//     borderTopWidth: 1,
//     borderColor: "#CCC",
//   },

//   proceedBtn: {
//     backgroundColor: "#E6E6E6",
//     paddingHorizontal: scale(14),
//     paddingVertical: verticalScale(6),
//     borderWidth: 1,
//     borderColor: "#888",
//     marginLeft: scale(10),
//   },

//   cancelBtn: {
//     backgroundColor: "#E6E6E6",
//     paddingHorizontal: scale(14),
//     paddingVertical: verticalScale(6),
//     borderWidth: 1,
//     borderColor: "#888",
//   },

//   btnText: {
//     fontSize: moderateScale(12),
//     fontWeight: "600",
//     color: "#000",
//   },
// });


