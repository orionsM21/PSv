// // ./Component/PaymentItem.js
// import React, { useMemo, useCallback } from "react";
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     Animated,
//     Platform,
// } from "react-native";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import { moderateScale, verticalScale, scale } from "react-native-size-matters";

// /**
//  * PaymentItem
//  * - lightweight, memoized presentation component
//  * - expects `item` shaped like your API objects
//  * - shows header row and brief details, supports expand via parent control
//  */
// const PaymentItem = ({
//     item,
//     index,
//     expandedCardIndex,
//     toggleCard,
//     onNavigate,
//     onEmail,
//     onSMS,
//     theme = {},
//     width = 360,
// }) => {
//     const isExpanded = expandedCardIndex === index;

//     const formattedAmount = useMemo(() => {
//         if (item?.amount == null) return "--";
//         return Number(item.amount).toLocaleString("en-IN");
//     }, [item?.amount]);

//     const paymentSubtitle = useMemo(() => {
//         const dt = item?.paymentDate ? item.paymentDate : "";
//         const time = item?.timeOfPayment ? item.timeOfPayment : "";
//         return `${dt}${time ? " • " + time : ""}`;
//     }, [item?.paymentDate, item?.timeOfPayment]);

//     const handleToggle = useCallback(() => toggleCard(index), [index, toggleCard]);

//     return (
//         <TouchableOpacity
//             activeOpacity={0.95}
//             onPress={onNavigate}
//             style={[styles.wrapper, { width: Math.min(width - 32, 960) }]}
//         >
//             <View style={styles.row}>
//                 <View style={styles.left}>
//                     <Text style={styles.lanText}>{item?.loanAccountNumber ?? "--"}</Text>
//                     <Text numberOfLines={1} style={styles.subText}>
//                         {item?.paymentType ?? "Payment"} • {item?.paymentMode ?? "Mode"}
//                     </Text>
//                 </View>

//                 <View style={styles.right}>
//                     <Text style={styles.amountText}>₹{formattedAmount}</Text>
//                     <Text style={styles.statusText(item?.paymentStatus)}>
//                         {item?.paymentStatus ?? "--"}
//                     </Text>
//                 </View>
//             </View>

//             <View style={styles.metaRow}>
//                 <Text style={styles.metaText}>{paymentSubtitle}</Text>

//                 <TouchableOpacity
//                     onPress={handleToggle}
//                     hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                 >
//                     <MaterialIcons
//                         name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
//                         size={scale(22)}
//                         color="#333"
//                     />
//                 </TouchableOpacity>
//             </View>

//             {isExpanded && (
//                 <Animated.View style={styles.expandArea}>
//                     <View style={styles.detailRow}>
//                         <Text style={styles.detailLabel}>Phone</Text>
//                         <Text style={styles.detailValue}>{item?.phoneNumber ?? "--"}</Text>
//                     </View>

//                     <View style={styles.detailRow}>
//                         <Text style={styles.detailLabel}>EMI / Pending</Text>
//                         <Text style={styles.detailValue}>
//                             ₹{(item?.emiAmount ?? "--")} / ₹{(item?.pendingEmiAmount ?? "--")}
//                         </Text>
//                     </View>

//                     <View style={styles.actionsRow}>
//                         <TouchableOpacity onPress={onEmail} style={styles.actionBtn}>
//                             <MaterialIcons name="email" size={18} color="#fff" />
//                             <Text style={styles.actionText}>Email</Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity onPress={onSMS} style={[styles.actionBtn, styles.smsBtn]}>
//                             <MaterialIcons name="sms" size={18} color="#fff" />
//                             <Text style={styles.actionText}>SMS</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </Animated.View>
//             )}
//         </TouchableOpacity>
//     );
// };

// export default React.memo(PaymentItem);

// const styles = StyleSheet.create({
//     wrapper: {
//         marginHorizontal: 16,
//         marginVertical: 8,
//         borderRadius: moderateScale(12),
//         backgroundColor: "#fff",
//         padding: moderateScale(12),
//         // subtle card shadow
//         ...Platform.select({
//             ios: {
//                 shadowColor: "#000",
//                 shadowOpacity: 0.06,
//                 shadowOffset: { width: 0, height: 3 },
//                 shadowRadius: 6,
//             },
//             android: {
//                 elevation: 3,
//             },
//         }),
//         borderWidth: 1,
//         borderColor: "#F0F0F2",
//     },
//     row: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "flex-start",
//     },
//     left: {
//         flex: 1,
//         paddingRight: 8,
//     },
//     lanText: {
//         fontSize: moderateScale(15),
//         fontWeight: "800",
//         color: "#0A0A0A",
//     },
//     subText: {
//         fontSize: moderateScale(12),
//         color: "#6B7280",
//         marginTop: 4,
//     },
//     right: {
//         alignItems: "flex-end",
//         justifyContent: "center",
//     },
//     amountText: {
//         fontSize: moderateScale(16),
//         fontWeight: "900",
//         color: "#0B57A4",
//     },
//     statusText: (status) => ({
//         marginTop: 6,
//         fontSize: moderateScale(12),
//         fontWeight: "700",
//         color: status === "Success" ? "#0A8A1A" : status === "Pending" ? "#B45309" : "#374151",
//     }),
//     metaRow: {
//         marginTop: 8,
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },
//     metaText: {
//         color: "#9CA3AF",
//         fontSize: moderateScale(12),
//     },
//     expandArea: {
//         marginTop: 12,
//         borderTopWidth: 1,
//         borderTopColor: "#F3F4F6",
//         paddingTop: 10,
//     },
//     detailRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         paddingVertical: 6,
//     },
//     detailLabel: {
//         color: "#6B7280",
//         fontSize: moderateScale(13),
//     },
//     detailValue: {
//         color: "#111827",
//         fontSize: moderateScale(13),
//         fontWeight: "700",
//     },
//     actionsRow: {
//         flexDirection: "row",
//         marginTop: 10,
//     },
//     actionBtn: {
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 10,
//         backgroundColor: "#001B5E",
//         marginRight: 8,
//     },
//     smsBtn: {
//         backgroundColor: "#0A84FF",
//     },
//     actionText: {
//         color: "#fff",
//         fontSize: moderateScale(13),
//         fontWeight: "700",
//         marginLeft: 6,
//     },
// });


// ./Component/PaymentItem.js
import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";

const PaymentItem = ({
  item,
  index,
  expandedCardIndex,
  toggleCard,
  onNavigate,
  onEmail,
  onSMS,
  theme,
  width,
}) => {
  const isExpanded = expandedCardIndex === index;

  const handleToggle = useCallback(() => toggleCard(index), [index, toggleCard]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#F39C12";
      case "Success":
        return "#27AE60";
      case "Rejected":
        return "#E74C3C";
      default:
        return "#555";
    }
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: scale(12),
        marginHorizontal: scale(8),
        marginVertical: verticalScale(6),
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* ---------- HEADER ---------- */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate(item)}
        style={{
          backgroundColor: "#F8FAFF",
          paddingVertical: verticalScale(12),
          paddingHorizontal: scale(12),
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: isExpanded ? 1 : 0,
          borderColor: "#E5E8EC",
        }}
      >
        <Text style={{ fontSize: moderateScale(15), fontWeight: "700", color: "#001D56" }}>
          Payment
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: moderateScale(13), color: "#444", marginRight: 6 }}>
            {moment(item?.createdTime).format("DD-MM-YYYY hh:mm A")}
          </Text>

          <TouchableOpacity onPress={handleToggle}>
            <MaterialIcons
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={scale(24)}
              color="#001D56"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ---------- EXPANDED CONTENT ---------- */}
      {isExpanded && (
        <View style={{ paddingHorizontal: scale(12), paddingVertical: verticalScale(10) }}>

          {/* Row 1 - Name + Created Date */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {item?.user?.firstName} {item?.user?.lastName}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.label}>Created Date Time</Text>
              <Text style={styles.value}>
                {moment(item?.createdTime).format("DD-MM-YYYY hh:mm A")}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 2 - Amount + Status */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Amount</Text>
              <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 3 }}>
                <Image
                  source={require("../../../asset/icons/rupee.png")}
                  style={{
                    width: scale(13),
                    height: scale(13),
                    tintColor: "#001D56",
                    marginRight: 3,
                  }}
                />
                <Text style={[styles.value, { color: theme.light.voilet }]}>
                  {item.amount}
                </Text>
              </View>
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: getStatusColor(item.paymentStatus) }]}>
                {item.paymentStatus}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 3 - Payment Mode + Type */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Payment Mode</Text>
              <Text style={[styles.value, { color: theme.light.voilet }]}>
                {item.paymentMode}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={styles.label}>Payment Type</Text>
              <Text style={[styles.value, { color: theme.light.voilet }]}>
                {item.paymentType}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 4 - Remarks + Actions */}
          <View style={[styles.row, { alignItems: "center" }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Remarks</Text>
              <Text style={[styles.value, { color: theme.light.voilet }]}>
                {item.remark ?? "-"}
              </Text>
            </View>

            {item.paymentStatus === "Success" && (
              <View style={{ flexDirection: "row", gap: scale(14) }}>
                <TouchableOpacity onPress={() => onSMS(item)}>
                  <Text style={styles.action}>SMS</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onEmail(item)}>
                  <Text style={styles.action}>Email</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default React.memo(PaymentItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(6),
  },
  label: {
    fontSize: moderateScale(12.5),
    fontWeight: "600",
    color: "#6B7280",
  },
  value: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#111",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: verticalScale(6),
  },
  action: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#007AFF",
  },
});
