import React, { memo, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { losColors, losGradients } from "../../theme/losTheme.js";

const DetailHeader = memo(
    ({
        title = "Details",
        subTitle = "",
        status = "",
        chips = [],
        gradientColors = losGradients.classicHero,
    }) => {
        const resolvedStatus = status || "Pending";

        const statusTone = useMemo(() => {
            const normalized = resolvedStatus.toLowerCase();

            if (
                normalized.includes("approve") ||
                normalized.includes("sanction") ||
                normalized.includes("disbursed") ||
                normalized.includes("success")
            ) {
                return styles.statusPillSuccess;
            }

            if (
                normalized.includes("reject") ||
                normalized.includes("fail") ||
                normalized.includes("decline")
            ) {
                return styles.statusPillDanger;
            }

            return styles.statusPillNeutral;
        }, [resolvedStatus]);

        return (
            <View style={styles.headerWrapper}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerCard}
                >
                    <View style={styles.headerRow}>
                        <View style={styles.headerCopy}>
                            <Text style={styles.headerEyebrow}>LOS Detail Desk</Text>
                            <Text style={styles.headerTitle}>{title}</Text>
                            {subTitle ? (
                                <Text style={styles.headerSubTitle}>{subTitle}</Text>
                            ) : null}
                        </View>

                        <View style={[styles.statusPill, statusTone]}>
                            <Text style={styles.statusText}>{resolvedStatus}</Text>
                        </View>
                    </View>

                    {chips.length ? (
                        <View style={styles.chipGrid}>
                            {chips.map((chip, index) => (
                                <View
                                    key={`${chip.label || "chip"}-${index}`}
                                    style={styles.headerChip}
                                >
                                    <Text style={styles.chipLabel} numberOfLines={1}>
                                        {chip.label}
                                    </Text>
                                    <Text style={styles.chipValue} numberOfLines={2}>
                                        {chip.value ?? "N/A"}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </LinearGradient>
            </View>
        );
    }
);

export default DetailHeader;

const styles = StyleSheet.create({
    headerWrapper: {
        marginHorizontal: 14,
        marginBottom: 14,
        borderRadius: 24,
        shadowColor: losColors.brand[800],
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 16,
        elevation: 5,
    },
    headerCard: {
        borderRadius: 24,
        padding: 18,
        overflow: "hidden",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    headerCopy: {
        flex: 1,
    },
    headerEyebrow: {
        fontSize: 11,
        fontWeight: "800",
        color: "rgba(255,255,255,0.84)",
        textTransform: "uppercase",
        letterSpacing: 0.7,
    },
    headerTitle: {
        marginTop: 6,
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
    },
    headerSubTitle: {
        marginTop: 8,
        color: "rgba(255,255,255,0.84)",
        fontSize: 13,
        lineHeight: 20,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    statusPillSuccess: {
        backgroundColor: "rgba(16,185,129,0.28)",
    },
    statusPillDanger: {
        backgroundColor: "rgba(239,68,68,0.28)",
    },
    statusPillNeutral: {
        backgroundColor: "rgba(255,255,255,0.14)",
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "800",
    },
    chipGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 16,
    },
    headerChip: {
        width: "47%",
        minWidth: 140,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },
    chipLabel: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.72)",
    },
    chipValue: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
