import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const LeadCard = React.memo(
  ({
    item,
    index,
    expandedItem,
    isExpanded,
    toggleExpand,
    handleCardPress,
    isRejected,
    hasAppId,
  }) => {
    // Status + expand aware gradient
    const gradientColors = isRejected
      ? isExpanded
        ? ["#FEE2E2", "#E44848"] // expanded red
        : ["#FFF5F5", "#F19292"] // collapsed red
      : hasAppId
      ? isExpanded
        ? ["#C9FCCA", "#27D772"] // expanded green
        : ["#ECFDF5", "#9EE7C2"] // collapsed green
      : isExpanded
      ? ["#F0F9FF", "#FFFFFF"] // expanded normal
      : ["#FFFFFF", "#F9FAFB"]; // collapsed normal

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.cardContainer}
        onPress={() => handleCardPress(item)}
      >
        <LinearGradient
          colors={gradientColors}
          style={[styles.card, isExpanded && styles.expandedCard]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowText}>
                <Text style={styles.cardLabel}>
                  {item?.organizationName ? "Organization Name:" : "Lead Name:"}
                </Text>{" "}
                {item.organizationName ||
                  `${item.firstName} ${item.middleName || ""} ${item.lastName}`}
              </Text>

              <Text style={styles.rowText}>
                <Text style={styles.cardLabel}>Lead ID:</Text> {item.leadId}
              </Text>

              {item?.applicantCategoryCode && (
                <Text style={styles.rowText}>
                  <Text style={styles.cardLabel}>Applicant Category:</Text>{" "}
                  {item.applicantCategoryCode}
                </Text>
              )}

              {item?.appId && (
                <Text style={styles.rowText}>
                  <Text style={styles.cardLabel}>Application Number:</Text>{" "}
                  {item.appId}
                </Text>
              )}

              {item?.assignTo?.userName && (
                <Text style={styles.rowText}>
                  <Text style={styles.cardLabel}>Pending at:</Text>{" "}
                  {item.assignTo?.userName}
                </Text>
              )}
            </View>

            {/* Expand Icon */}
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <Text style={styles.expandIcon}>{isExpanded ? "▲" : "▼"}</Text>
            </TouchableOpacity>
          </View>

          {/* EXPANDED SECTION */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              {[
                ["Gender", item.gender],
                ["Mobile Number", item.mobileNo],
                ["Email", item.email],
                ["Lead Stage", item.leadStage],
                ["Lead Status", item?.leadStatus?.leadStatusName],
                ["PAN", item.pan],
                [
                  "Assigned To",
                  `${item.assignTo?.firstName || ""} ${
                    item.assignTo?.lastName || ""
                  }`.trim(),
                ],
              ]
                .filter(([_, value]) => value)
                .map(([label, value], idx) => (
                  <View key={idx} style={styles.textRow}>
                    <Text style={styles.cardLabel}>{label}:</Text>
                    <Text style={styles.cardValue}>{value}</Text>
                  </View>
                ))}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
);

export default LeadCard;

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 10,
    marginVertical: 6,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  expandedCard: {
    borderColor: "#3B82F6",
    elevation: 7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2196F3",
  },
  rowText: {
    fontSize: 14,
    color: "#0F172A",
    marginBottom: 2,
  },
  cardLabel: {
    fontWeight: "600",
    color: "#475569",
  },
  cardValue: {
    fontSize: 14,
    color: "#111",
  },
  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  textRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 8,
    marginVertical: 3,
  },
});
