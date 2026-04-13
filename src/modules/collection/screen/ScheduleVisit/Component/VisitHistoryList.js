// /components/VisitHistoryList.js
import React, { memo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";
import moment from "moment";
import { theme, white } from "../../../utility/Theme";

const VisitCard = memo(({ item, onSelect }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
        >
            {/* Date & Time */}
            <Text style={styles.date}>
                {moment(item.date).format("DD MMM YYYY")} • {item.time}
            </Text>

            {/* Name */}
            <Text style={styles.name}>{item.name}</Text>

            {/* Address */}
            <Text numberOfLines={2} style={styles.address}>
                {item.address}
            </Text>

            <View style={styles.rowBetween}>
                {/* Status Badge */}
                <View
                    style={[
                        styles.badge,
                        item.status === "Completed"
                            ? styles.badgeCompleted
                            : item.status === "ReScheduled"
                            ? styles.badgeRescheduled
                            : styles.badgeCancelled,
                    ]}
                >
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>

                {/* Outcome (if completed) */}
                {item.status === "Completed" && (
                    <Text style={styles.outcome}>Outcome: {item.outcome}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
});

export default function VisitHistoryList({ data = [], onSelect }) {
    if (!data?.length)
        return (
            <View style={{ alignItems: "center", marginTop: 30 }}>
                <Text style={{ color: "#777", fontSize: 15 }}>
                    No visits found
                </Text>
            </View>
        );

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.visitId?.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
                <VisitCard item={item} onSelect={onSelect} />
            )}
        />
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    date: {
        fontSize: 13,
        fontWeight: "600",
        color: theme.light.darkBlue,
        marginBottom: 4,
    },

    name: {
        fontSize: 15,
        fontWeight: "700",
        color: theme.light.black,
    },

    address: {
        fontSize: 14,
        marginTop: 6,
        color: "#555",
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
    },

    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },

    badgeText: {
        color: white,
        fontWeight: "700",
        fontSize: 12,
    },

    badgeCompleted: {
        backgroundColor: "#059669",
    },

    badgeRescheduled: {
        backgroundColor: "#2563EB",
    },

    badgeCancelled: {
        backgroundColor: "#DC2626",
    },

    outcome: {
        fontSize: 13,
        fontWeight: "600",
        color: "#444",
    },
});
