import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const DetailHeader = memo(
    ({
        title = "Details",
        subTitle = "",
        status = "",
        chips = [],
        // gradientColors = ["#003A8C", "#005BEA"],
        // gradientColors = ["#508FF5FF", "#F1F1F1FF",],
    }) => {
        return (
            <View style={styles.headerWrapper}>
                <View
                    // colors={gradientColors}
                    // start={{ x: 0.4, y: 0 }}
                    // end={{ x: 1, y: 1 }}
                    style={[styles.headerCard, { backgroundColor: '#2196F3' }]}
                // style={[styles.headerCard]}
                >
                    {/* ✦ TITLE + STATUS */}
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>{title}</Text>
                            <Text style={styles.headerSubTitle}>{subTitle}</Text>
                        </View>

                        <View style={styles.statusPill}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                    </View>

                    {/* ✦ CHIPS GRID */}
                    <View style={styles.chipGrid}>
                        {chips.map((chip, index) => (
                            <View
                                key={chip.label}
                                style={[
                                    styles.headerChip,
                                    (index + 1) % 2 === 0 && { marginRight: 0 },
                                ]}
                            >
                                <Text style={styles.chipLabel}>{chip.label}</Text>
                                <Text style={styles.chipValue}>{chip.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View >
        );
    }
);

export default DetailHeader;

const styles = StyleSheet.create({
    headerWrapper: { paddingHorizontal: 0 },
    headerCard: {
        padding: 16,
        borderRadius: 12,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
    headerSubTitle: { color: "#D6E4FF", marginTop: 3 },
    statusPill: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: { color: "#fff", fontWeight: "600" },

    chipGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    headerChip: {
        width: "48%",
        backgroundColor: "rgba(255,255,255,0.15)",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginRight: "4%",
    },
    chipLabel: {
        color: "#C6D8FF",
        fontSize: 12,
    },
    chipValue: {
        color: "#fff",
        fontWeight: "600",
        marginTop: 2,
    },
});
