import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    LayoutAnimation,
    UIManager,
} from "react-native";
import LinearGradient from "react-native-linear-gradient"; // or 'expo-linear-gradient' if using Expo

const { width } = Dimensions.get("window");

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ApplicationCardDetail = ({
    item,
    idleApplicationList = [],
    isExpanded,
    userDetails = {},
    onToggleExpand,
    handleCardPress, currentPages = [],
    isPinned = false,          // ⭐ NEW
    onTogglePin,
}) => {
    const applicant = item?.applicant?.[0]?.individualApplicant;
    const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === "Applicant");
    const idleEntry = idleApplicationList.find(idle => idle.applicationNo === item.applicationNo);
    const pageArray = Array.isArray(currentPages) ? currentPages : [currentPages];
    console.log(idleEntry, 'FromDecisionidleEntry')
    const handleToggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (typeof onToggleExpand === "function") {
            onToggleExpand(item.applicationNo);
        }
    };


    const handlePress = () => {
        if (handleCardPress) handleCardPress(item); // ✅ Trigger parent function
    };

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            style={[styles.cardContainer]}
            onPress={handlePress}
            onLongPress={handleToggle}
        >
            <LinearGradient
                colors={isExpanded ? ["#F0F9FF", "#FFFFFF"] : ["#FFFFFF", "#F9FAFB"]}
                style={[styles.card, isExpanded && styles.expandedCard]}
            >
                {/* 🔹 Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        {item.applicationNo && (
                            <Text style={styles.title}>Application Number: {item.applicationNo}</Text>
                        )}
                        {item.leadId && (
                            <Text style={styles.title}>leadID: {item.leadId}</Text>
                        )}

                        <Text style={styles.text}>
                            Name:{" "}
                            {aaplicantName?.individualApplicant
                                ? `${aaplicantName?.individualApplicant?.firstName || ""} ${aaplicantName?.individualApplicant?.middleName || ""}  ${aaplicantName?.individualApplicant?.lastName || item?.lastName || ""}`.trim()
                                : aaplicantName?.organizationApplicant?.organizationName || `${item?.firstName}${' '}${item?.lastName}` || "N/A"}
                        </Text>

                        {/* 🔸 Stage Badge */}
                        {/* Stage Badge */}
                        {(item.stage || item.leadStage) && (
                            <View
                                style={[
                                    styles.badge,
                                    (item.stage || item.leadStage) === "Rejected"
                                        ? styles.badgeRejected
                                        : (item.stage || item.leadStage) === "Disbursed"
                                            ? styles.badgeApproved
                                            : styles.badgePending,
                                ]}
                            >
                                <Text style={styles.badgeText}>
                                    {item.stage || item.leadStage}
                                </Text>
                            </View>
                        )}


                        {/* 🔸 Idle Time */}
                        {idleEntry?.idleHours &&
                            item.stage !== "Disbursed" &&
                            item.stage !== "Rejected" &&
                            pageArray.some(page =>
                                idleEntry.descriptions?.some(desc => desc.includes(page))
                            ) && (
                                <Text style={styles.idleText}>
                                    Idle Time: {idleEntry.idleTime} ({idleEntry.idleHours} hrs)
                                </Text>
                            )}


                        {/* 🔸 User (CEO Only) */}
                        {userDetails?.designation === "CEO" &&
                            idleEntry?.user &&
                            item.stage !== "Disbursed" && (
                                <Text style={styles.text}>User: {idleEntry.user}</Text>
                            )}
                    </View>

                    {/* Expand / Collapse icon */}
                    <View style={styles.rightActions}>
                        {/* ⭐ PIN */}
                        <TouchableOpacity
                            onPress={() => onTogglePin?.(item.applicationNo)}
                            hitSlop={10}
                        >
                            <Text style={[styles.pinIcon, isPinned && styles.pinned]}>
                                {isPinned ? "⭐" : "☆"}
                            </Text>
                        </TouchableOpacity>

                        {/* EXPAND */}
                        <TouchableOpacity onPress={handleToggle}>
                            <Text style={styles.expandIcon}>
                                {isExpanded ? "▲" : "▼"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 🔹 Expanded Section */}
                {isExpanded && (
                    <View style={styles.expanded}>
                        {renderRow("Product", item.productName || item?.product?.productName)}
                        {renderRow("Portfolio", item.portfolioDescription || item?.product?.portfolio?.portfolioDescription)}
                        {renderRow("Category", item.applicant?.[0]?.applicantCategoryCode || item?.applicantCategoryCode)}
                        {renderRow("Mobile No", applicant?.mobileNumber || item?.mobileNo)}
                        {renderRow("Stage", item?.stage || item?.leadStage)}
                        {renderRow("PAN", applicant?.pan || item?.pan)}

                        {/* 🔸 View Details Button */}

                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

// 🔸 Helper to render rows
const renderRow = (label, value) => (
    <View style={styles.textRow}>
        <Text style={styles.cardLabel}>{label}:</Text>
        <Text style={styles.cardValue}>{value || "N/A"}</Text>
    </View>
);

export default ApplicationCardDetail;

// ----------------------
// ✨ Modern Responsive Styles
// ----------------------
const styles = StyleSheet.create({
    cardContainer: {
        marginHorizontal: 10,
        marginVertical: 6,
    },
    card: {
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#fff",
        elevation: 4,
    },
    expandedCard: {
        elevation: 6,
    },
    header: {
        flexDirection: "row",
    },
    rightActions: {
        alignItems: "center",
        marginLeft: 10,
    },
    title: {
        fontSize: 14.5,
        fontWeight: "600",
        color: "#111827",
    },
    text: {
        fontSize: 13.5,
        color: "#374151",
        marginTop: 4,
    },
    badge: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    badgeApproved: { backgroundColor: "#16A34A" },
    badgeRejected: { backgroundColor: "#DC2626" },
    badgePending: { backgroundColor: "#6B7280" },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    pinIcon: {
        fontSize: 20,
        color: "#9CA3AF",
        marginBottom: 6,
    },
    pinned: {
        color: "#F59E0B",
    },
    expandIcon: {
        fontSize: 18,
        color: "#2563EB",
        fontWeight: "700",
    },
    expanded: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 10,
    },
    textRow: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginVertical: 4,
    },
    cardLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
    },
    cardValue: {
        flex: 1.2,
        fontSize: 14,
        color: "#0F172A",
    },
    idleText: {
        color: "#E11D48",
        fontSize: 13,
        marginTop: 4,
    },
});

